import { VoteType } from '@prisma/client';

export type ReportVoteResult = {
  incidentId: string;
  userEmail: string;
  isAnonymous: boolean;
  votes: { type: VoteType | null }[];
};

export type ReportUserProfile = {
  email: string;
  name: string;
  profilePhoto: string | null;
  reputation: number;
};

export type ReportComment = {
  id: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user: ReportUserProfile;
};
