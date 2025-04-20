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
    const query = `
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
        route AS (
          SELECT * FROM pgr_astar(
            'SELECT gid as id, source, target, cost, reverse_cost, x1, y1, x2, y2 FROM ways',
            (SELECT id FROM start_vertex),
            (SELECT id FROM end_vertex),
            directed := false
          )
        )
      SELECT ST_AsGeoJSON(w.the_geom) AS geojson
        FROM route r
      JOIN ways w ON r.edge = w.gid
      ORDER BY r.seq;
    `;

    return this.prisma.$queryRawUnsafe(query);
  }
}
