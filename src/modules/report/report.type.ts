import { Prisma } from '@prisma/client';

export type ReportInput = {
  userEmail: string;
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
  date_start: Date;
  date_end: Date;
  time_start: Date;
  time_end: Date;
};

export type ReportResult = Prisma.ReportGetPayload<{
  select: {
    id: true;
    date: true;
    time: true;
    latitude: true;
    longitude: true;
  };
}>;

export type ReportPreviewResult = Prisma.ReportGetPayload<{
  select: {
    id: true;
    description: true;
  };
}>;

export type ReportDetailResult = Prisma.ReportGetPayload<{
  select: {
    id: true;
    description: true;
    date: true;
    time: true;
    status: true;
    latitude: true;
    longitude: true;
    incident: {
      select: {
        id: true;
        category: { select: { name: true } };
      };
    };
    user: {
      select: {
        name: true;
        profilePhoto: true;
        reputation: true;
      };
    };
    attachments: { select: { uri: true } };
    votes: { select: { type: true } };
    comments: {
      select: {
        id: true;
        comment: true;
        createdAt: true;
        updatedAt: true;
        user: {
          select: {
            name: true;
            profilePhoto: true;
            reputation: true;
          };
        };
      };
    };
  };
}>;
