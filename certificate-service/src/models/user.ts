export interface User {
  fullname: string,
  divisionTitle: string,
  jobTitle: string,
  scientificDegree: string
}

export interface UserRoles {
  isParticipant:      boolean,
  isModerator:        boolean,
  isExpert:           boolean,
  isOrganizer:        boolean,
  isAuditor:          boolean,
  isCertificateUser?: boolean,
  /** Технический администратор сервиса справок */
  isSystemAdmin?:     boolean,
}

export interface Application {
  number: number,
  directionTitle: string,
  statusTitle: string,
  year: number,
  sentAt: string,
  id: string
}

export interface UserApplications {
  items: Application[]
  total: number
  sentAt: string,
  id: string
}