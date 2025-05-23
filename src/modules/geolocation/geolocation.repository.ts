import { Injectable } from '@nestjs/common';
import { RouteResult } from './geolocation.type';
import { BaseRepository } from '../shared/base.repository';

@Injectable()
export class GeolocationRepository extends BaseRepository {
  public async findSafeRouteWithAStar(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
  ): Promise<RouteResult[]> {
    return this.prisma.$queryRaw`
      WITH
        start_vertex AS (
          SELECT id
          FROM ways_vertices_pgr
          ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(${startLon}, ${startLat}), 4326)
          LIMIT 1
        ),
        end_vertex AS (
          SELECT id
          FROM ways_vertices_pgr
          ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(${endLon}, ${endLat}), 4326)
          LIMIT 1
        ),
        routing AS (
          SELECT seq, edge FROM pgr_aStar(
            $$
              SELECT 
                gid AS id, source, target,
                adjust_cost(i.risk_level, cost) AS cost,
                adjust_cost(i.risk_level, reverse_cost) AS reverse_cost,
                x1, y1, x2, y2
              FROM ways w
              LEFT JOIN LATERAL (
                SELECT i.risk_level FROM "Incident" i
                JOIN "IncidentCategory" ic ON ic.id = i.category_id 
                WHERE status IN ('admin_verified', 'verified') AND
                  CURRENT_DATE BETWEEN i.date_start AND (i.date_end + ic.ttl_date) AND
                  CURRENT_TIME BETWEEN (i.time_start - INTERVAL '1 hour') AND (i.time_end + INTERVAL '1 hour') AND
                  ST_DWithin(location::geography, w.the_geom::geography, 10)
                ORDER BY risk_level ASC 
                LIMIT 1
              ) i ON TRUE
            $$,
            (SELECT id FROM start_vertex),
            (SELECT id FROM end_vertex),
            directed := TRUE
          )
        )
      SELECT ST_AsGeoJSON(w.the_geom) AS geojson 
      FROM routing r
      JOIN ways w ON r.edge = w.gid
      ORDER BY r.seq;
    `;
  }
}
