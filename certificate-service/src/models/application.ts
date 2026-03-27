export interface Application{
  participant: Participant,
  agreement: boolean,
  hasNoStateSecrets: boolean
  contacts: Contacts,
  direction: Direction | null,
  essay: Essay | null,
  articles: Article[],
  commentFromModerator?: string,
  ssnprScore: number | null,
  articlesScore: number | null,
  essayScore: number | null,
  finalScore: number | null,
  moderationStatus: string,
  essayScoringDetails: EssayScoringDetails,
  canSend: boolean,
}

export interface ApplicationById extends Application{
    contestYear: number,
    status: string,
}

export interface Contacts {
    phoneNumber: string | null
}

export interface Participant {
    fullname: string,
    divisionTitle: string,
    jobTitle: string,
    scientificDegree: string
}

export interface Direction {
    id: string,
    title: string
}

export interface Essay {
    fileName: string,
    uploadedAt: string,
    fileSizeInBytes: number,
}
export interface Article {
    id: string,
    externalId: string,
    articleTitle: string,
    journalTitle: string,
    pubYear: number,
    category: string,
    link: string
    score: null | number
}

export interface SelectedDirection {
    directionId: string
}

export interface Agreement {
    agreement: boolean
}

export interface Secret {
    hasNoStateSecrets: boolean
}

export interface EssayScoringDetails {
    expert1: Expert,
    expert2: Expert,
    expert3: Expert
}

interface Expert {
    isLocked: boolean,
    score1: number | null,
    score2: number | null,
    score3: number | null,
    score4: number | null,
    score5?: number | null,
    score6?: number | null,
    score7?: number | null,
    score8?: number | null,
    [key: string]: number | null | undefined | boolean
}