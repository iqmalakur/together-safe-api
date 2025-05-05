import { Injectable } from '@nestjs/common';
import { RouteResult } from './geolocation.type';
import { BaseRepository } from '../shared/base.repository';
import {
  SAFE_ROUTE_RADIUS_METERS,
  SRID_WGS84,
} from 'src/constants/map.constant';

@Injectable()
export class GeolocationRepository extends BaseRepository {
  public async findSafeRouteWithAStar(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
  ): Promise<RouteResult[]> {
    const query = `
      WITH
        start_vertex AS (
          SELECT id
          FROM ways_vertices_pgr
          ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(${startLon}, ${startLat}), ${SRID_WGS84})
          LIMIT 1
        ),
        end_vertex AS (
          SELECT id
          FROM ways_vertices_pgr
          ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(${endLon}, ${endLat}), ${SRID_WGS84})
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
                SELECT risk_level FROM "Incident" 
                WHERE ST_DWithin(location::geography, w.the_geom::geography, ${SAFE_ROUTE_RADIUS_METERS}) 
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

    return this.prisma.$queryRawUnsafe(query);
  }
}
