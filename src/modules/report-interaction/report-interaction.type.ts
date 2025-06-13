import { VoteType } from '@prisma/client';

export type VoteResult = {
  type: VoteType | null;
};

export type ReportVoteResult = {
  incidentId: string;
  userEmail: string;
  isAnonymous: boolean;
  votes: VoteResult[];
};

export type IncidentVoteResult = {
  id: string;
  status: string;
  upvote_count: number;
  downvote_count: number;
};

export type ReportUserProfile = {
  email: string;
  name: string;
  profilePhoto: string | null;
};

export type ReportComment = {
  id: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user: ReportUserProfile;
};
