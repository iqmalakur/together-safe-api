import { Injectable } from '@nestjs/common';
import { NominatimResponse, RouteResult } from './geolocation.type';
import axios from 'axios';
import { handleError } from '../../utils/common.util';
import { BaseRepository } from '../shared/base.repository';

@Injectable()
export class GeolocationRepository extends BaseRepository {
  public async findLocation(query: string): Promise<NominatimResponse[]> {
    try {
      const result = await axios.get<NominatimResponse[]>(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json`,
        {
          headers: {
            'User-Agent': 'TogetherSafe/1.0 (iqmalak21@if.unjani.ac.id)',
          },
        },
      );

      return result.data;
    } catch (e) {
      throw handleError(e, this.logger);
    }
  }

  public async findSafeRouteWithAStar(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
  ): Promise<RouteResult[]> {
    const query = `
      SELECT 
        ST_AsGeoJSON(w.the_geom) AS geojson
        -- ST_AsText(w.the_geom) AS geom_text -- 🔧 optional: jika butuh geometry, convert ke teks
      FROM pgr_astar(
        $$
        SELECT 
          w.gid AS id,
          w.source,
          w.target,
          w.length *
            CASE 
              WHEN EXISTS (
                SELECT 1 
                FROM "Incident" i 
                WHERE i.status = 'active'
                  AND ST_Intersects(w.the_geom, ST_Buffer(i.location_area::geography, 50)::geometry)
                  AND i.risk_level = 'high'
              ) THEN 5
              WHEN EXISTS (
                SELECT 1 
                FROM "Incident" i 
                WHERE i.status = 'active'
                  AND ST_Intersects(w.the_geom, ST_Buffer(i.location_area::geography, 50)::geometry)
                  AND i.risk_level = 'medium'
              ) THEN 3
              WHEN EXISTS (
                SELECT 1 
                FROM "Incident" i 
                WHERE i.status = 'active'
                  AND ST_Intersects(w.the_geom, ST_Buffer(i.location_area::geography, 50)::geometry)
                  AND i.risk_level = 'low'
              ) THEN 1.5
              ELSE 1
            END AS cost,
          w.length AS reverse_cost,
          w.x1, w.y1, w.x2, w.y2
        FROM ways w
        $$,
        (
          SELECT gid 
          FROM ways 
          ORDER BY the_geom <-> ST_SetSRID(ST_Point(${startLon}, ${startLat}), 4326) 
          LIMIT 1
        ),
        (
          SELECT gid 
          FROM ways 
          ORDER BY the_geom <-> ST_SetSRID(ST_Point(${endLon}, ${endLat}), 4326) 
          LIMIT 1
        ),
        directed := false
      ) AS route
      JOIN ways w ON w.gid = route.edge;
    `;

    return this.prisma.$queryRawUnsafe(query);
  }
}
