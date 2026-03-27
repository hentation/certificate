import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

export type CertificateStatus =
    | "Новая"
    | "В работе"
    | "На доработке"
    | "Готова"
    | "Выдана"
    | "Отклонена";

export const CERTIFICATE_STATUSES: CertificateStatus[] = [
    "Новая",
    "В работе",
    "На доработке",
    "Готова",
    "Выдана",
    "Отклонена",
];

export const CERTIFICATE_TYPES = [
    "О трудовой деятельности",
    "О заработной плате",
    "О занимаемой должности",
    "Для предоставления в банк",
    "Для предоставления в посольство",
    "Иное",
] as const;

export type CertificateType = (typeof CERTIFICATE_TYPES)[number];

@Entity({ name: "certificate_requests" })
export class CertificateRequest {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column()
    public userId: string;

    @Column()
    public certificateType: string;

    @Column({ default: "По месту требования" })
    public purpose: string;

    @Column({ type: "int", default: 1 })
    public copies: number;

    @Column({ default: "Новая" })
    public status: string;

    @Column({ nullable: true, type: "text" })
    public adminComment: string | null;

    @Column({ nullable: true, type: "text" })
    public userComment: string | null;

    @Column({ type: "jsonb", default: [] })
    public files: FileAttachment[];

    @Column({ type: "jsonb", default: [] })
    public statusHistory: StatusHistoryEntry[];

    @CreateDateColumn({ type: "timestamptz" })
    public createdAt: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    public updatedAt: Date;
}

export interface FileAttachment {
    name: string;
    stored: string;
}

export interface StatusHistoryEntry {
    status: string;
    date: string;
    comment?: string;
}
