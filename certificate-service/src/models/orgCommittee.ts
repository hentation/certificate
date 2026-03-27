export interface OrgCommitteeApplications {
  items: OrgCommitteeApplication[];
  total: number;
}

export interface OrgCommitteeApplication {
  number: number;
  id: string;
  fullName: string;
  status: string;
  directionTitle: string;
  sentAt: string;
  scientificalScore: number | null;
  essayScore: number | null;
  finalScore: number | null;
  hasExperts: boolean;
  intramuralStage: boolean;
}

export interface OrgCommitteeApplicationsParams {
  page: number;
  pageSize: number;
  search?: string;
  direction?: string;
  status?: string;
  sort?: string;
  "sort-dir"?: "asc" | "desc";
}

export interface Status {
  id: string;
  title: string;
}

export interface Quantity {
  onReview: number;
  onScoring: number;
  rejected: number;
  intramuralStage: number;
}
