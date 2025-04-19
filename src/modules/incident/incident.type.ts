export type IncidentAttachment = {
  uri: string;
};

export type IncidentReportPreview = {
  id: string;
  description: string;
  attachments: IncidentAttachment[];
};

export interface IncidentPreviewResult {
  id: string;
  risk_level: string;
  latitude: number;
  longitude: number;
}

export interface IncidentDetailResult extends IncidentPreviewResult {
  category: string;
  status: string;
  date_start: Date;
  date_end: Date;
  time_start: Date;
  time_end: Date;
}

export interface IncidentSelection extends IncidentDetailResult {
  reports: IncidentReportPreview[];
}
