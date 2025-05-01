import {
  ReportComment,
  ReportUserProfile,
} from '../report-interaction/report-interaction.type';

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

export type ReportRelatedIncident = {
  id: string;
  date_start: Date;
  date_end: Date;
  time_start: Date;
  time_end: Date;
};

export type ReportResult = {
  latitude: number;
  longitude: number;
  id: string;
  date: Date;
  time: Date;
};

export type ReportPreviewResult = {
  id: string;
  description: string;
};

export type ReportCategory = {
  name: string;
};

export type ReportIncident = {
  id: string;
  category: ReportCategory;
};

export type ReportAttachment = {
  uri: string;
};

export type ReportVote = {
  type: string | null;
};

export type ReportDetailResult = {
  id: string;
  description: string;
  date: Date;
  time: Date;
  status: string;
  latitude: number;
  longitude: number;
  incident: ReportIncident;
  user: ReportUserProfile;
  attachments: ReportAttachment[];
  votes: ReportVote[];
  comments: ReportComment[];
};
