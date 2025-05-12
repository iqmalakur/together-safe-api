export type IncidentAttachment = {
  uri: string;
};

export type IncidentReportItem = {
  id: string;
  description: string;
  latitude: number;
  longitude: number;
  date: Date;
  time: Date;
  status: string;
  attachments: IncidentAttachment[];
};

export interface IncidentResult {
  id: string;
  category: string;
  status: string;
  risk_level: string;
  radius: number;
  latitude: number;
  longitude: number;
  date_start: Date;
  date_end: Date;
  time_start: Date;
  time_end: Date;
}

export interface VoteCountResult {
  upvote_count: 0;
  downvote_count: 0;
}

export interface IncidentSelection extends IncidentResult, VoteCountResult {
  reports: IncidentReportItem[];
}
