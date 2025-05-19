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
  isAnonymous: boolean;
};

export type ReportRelatedIncident = {
  id: string;
  radius: number;
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

export type ReportIncident = {
  id: string;
  category: ReportCategory;
};

export type ReportItemResult = {
  id: string;
  description: string;
  incident: ReportIncident;
  latitude: number;
  longitude: number;
  date: Date;
  time: Date;
};

export type ReportCategory = {
  name: string;
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
  isAnonymous: boolean;
  date: Date;
  time: Date;
  latitude: number;
  longitude: number;
  incident: ReportIncident;
  user: ReportUserProfile;
  attachments: ReportAttachment[];
  votes: ReportVote[];
  comments: ReportComment[];
};
