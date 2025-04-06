export type RawIncidentRow = {
  id: string;
  status: string;
  risk_level: string;
  date_start: Date;
  date_end: Date;
  time_start: Date;
  time_end: Date;
  latitude: number;
  longitude: number;
  category: string;
};

export type IncidentSelection = RawIncidentRow & {
  reports: {
    id: string;
    incidentId: string;
    description: string;
    attachments: string[];
  }[];
};
