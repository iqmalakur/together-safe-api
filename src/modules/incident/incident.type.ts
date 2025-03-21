import { Prisma } from '@prisma/client';

export type IncidentSelection = Prisma.IncidentGetPayload<{
  include: {
    category: {
      select: { name: true };
    };
    reports: {
      select: {
        id: true;
        description: true;
        attachments: {
          select: { uri: true };
        };
      };
    };
  };
}>;
