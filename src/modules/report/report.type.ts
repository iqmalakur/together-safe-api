import { Prisma } from '@prisma/client';

export type ReportInput = {
  userEmail: string;
  incidentId: string;
  description: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  mediaUrls: string[];
  categoryId: number;
};

export type RelatedIncident = {
  id: string;
  status: string;
  category: string;
};

export type ReportResult = Prisma.ReportGetPayload<{
  select: {
    id: true;
    status: true;
  };
}>;
