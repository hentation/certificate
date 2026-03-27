export interface ModerationApplications {
  items: ModerationApplication[];
  total: number;
}

export interface ModerationApplication {
  number: number;
  id: string;
  fullName: string;
  status: string;
  directionTitle: string;
  sentAt: string;
}

export interface ModerationApplicationsParams {
  page: number;
  pageSize: number;
  search?: string;
  direction?: string;
  status?: string;
  sort?: string;
  'sort-dir'?: 'asc' | 'desc';
}

export interface Status {
  id: string;
  title: string;
}