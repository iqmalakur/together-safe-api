import { Injectable } from '@nestjs/common';
import { IncidentSelection } from './incident.type';
import { BaseRepository } from '../shared/base.repository';

export interface IIncidentRepository {
  getIncidents(): Promise<IncidentSelection[]>;
}

@Injectable()
export class IncidentRepository
  extends BaseRepository
  implements IIncidentRepository
{
  public async getIncidents(): Promise<IncidentSelection[]> {
    return this.prisma.incident.findMany({
      include: {
        category: {
          select: { name: true },
        },
        reports: {
          select: {
            id: true,
            description: true,
            attachments: {
              select: { uri: true },
            },
          },
        },
      },
    });
  }
}
