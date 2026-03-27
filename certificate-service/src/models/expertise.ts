export interface ExpertiseApplications {
  items: ExpertiseApplication[];
  total: number;
}

export interface ExpertiseApplication {
  number: number;
  id: string;
  fullName: string;
  hasScore: boolean;
  essayScore: number | null;
}

export interface ExpertiseApplicationsParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface ExpertiseScores {
  score1: null | number,
  score2: null | number,
  score3: null | number,
  score4: null | number,
  score5?: null | number,
  score6?: null | number,
  score7?: null | number,
  score8?: null | number,
  isLocked: boolean,
  expertType: "scientifical" | "popularizer"
}