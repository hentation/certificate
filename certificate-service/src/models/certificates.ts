export type CertificateStatus =
    | 'Новая'
    | 'В работе'
    | 'На доработке'
    | 'Готова'
    | 'Выдана'
    | 'Отклонена';

export const CERTIFICATE_TYPES = [
    'О трудовой деятельности',
    'О заработной плате',
    'О занимаемой должности',
    'Для предоставления в банк',
    'Для предоставления в посольство',
    'Иное',
] as const;

export type CertificateType = (typeof CERTIFICATE_TYPES)[number];

export interface FileAttachment {
    name: string;
    stored: string;
}

export interface StatusHistoryEntry {
    status: string;
    date: string;
    comment?: string;
}

export interface CertificateRequest {
    id: string;
    userId: string;
    certificateType: string;
    purpose: string;
    copies: number;
    status: CertificateStatus;
    adminComment: string | null;
    userComment: string | null;
    files: FileAttachment[];
    statusHistory: StatusHistoryEntry[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateCertificateDto {
    certificateType: CertificateType;
    purpose?: string;
    copies?: number;
    files?: FileAttachment[];
    userComment?: string;
}

export interface UpdateCertificateDto {
    certificateType?: CertificateType;
    purpose?: string;
    copies?: number;
    files?: FileAttachment[];
    userComment?: string;
}
