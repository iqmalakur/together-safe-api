export type IncidentPreviewResult = {
  id: string;
  risk_level: string;
  latitude: number;
  longitude: number;
};

export type IncidentDetailResult = IncidentPreviewResult & {
  category: string;
  status: string;
  date_start: Date;
  date_end: Date;
  time_start: Date;
  time_end: Date;
};

export type IncidentSelection = IncidentDetailResult & {
  reports: {
    id: string;
    description: string;
    attachments: { uri: string }[];
  }[];
};
