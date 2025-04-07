import { Prisma } from '@prisma/client';

export type ReportInput = Prisma.ReportCreateInput & { categoryId: number };

export type RelatedIncident = {
  id: string;
  status: string;
  category: string;
};
