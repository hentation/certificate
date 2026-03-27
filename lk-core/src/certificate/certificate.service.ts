import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CertificateRequest, StatusHistoryEntry } from "./CertificateRequest.entity";
import { CreateCertificateDto, UpdateCertificateDto, UpdateStatusDto } from "./certificate.dto";

/** Статусы, при которых администратор обязан объяснить причину */
const STATUSES_REQUIRING_COMMENT: string[] = ["Отклонена", "На доработке"];

/** Единственный статус, при котором пользователь может редактировать заявку */
const EDITABLE_STATUS = "На доработке";

@Injectable()
export class CertificateService {
    constructor(
        @InjectRepository(CertificateRequest)
        private readonly repo: Repository<CertificateRequest>,
    ) {}

    async create(userId: string, dto: CreateCertificateDto): Promise<CertificateRequest> {
        const entity = this.repo.create({
            userId,
            certificateType: dto.certificateType,
            purpose: dto.purpose ?? "По месту требования",
            copies: dto.copies ?? 1,
            status: "Новая",
            adminComment: null,
            userComment: dto.userComment ?? null,
            files: dto.files ?? [],
            statusHistory: [{ status: "Новая", date: new Date().toISOString() }],
        });
        return this.repo.save(entity);
    }

    async findByUser(userId: string): Promise<CertificateRequest[]> {
        return this.repo.find({
            where: { userId },
            order: { createdAt: "DESC" },
        });
    }

    async findOne(id: string, userId: string): Promise<CertificateRequest> {
        const entity = await this.repo.findOneBy({ id, userId });
        if (!entity) throw new NotFoundException("Заявка не найдена");
        return entity;
    }

    async findAll(): Promise<CertificateRequest[]> {
        return this.repo.find({ order: { createdAt: "DESC" } });
    }

    /**
     * Пользователь может редактировать заявку ТОЛЬКО в статусе «На доработке».
     * После сохранения статус автоматически меняется обратно на «Новая»,
     * чтобы администратор увидел обновлённую заявку.
     */
    async updateByUser(
        id: string,
        userId: string,
        dto: UpdateCertificateDto,
    ): Promise<CertificateRequest> {
        const entity = await this.repo.findOneBy({ id, userId });
        if (!entity) throw new NotFoundException("Заявка не найдена");

        if (entity.status !== EDITABLE_STATUS) {
            throw new ForbiddenException(
                `Редактировать заявку можно только при статусе «${EDITABLE_STATUS}». Текущий статус: «${entity.status}»`,
            );
        }

        if (dto.certificateType !== undefined) entity.certificateType = dto.certificateType;
        if (dto.purpose !== undefined) entity.purpose = dto.purpose;
        if (dto.copies !== undefined) entity.copies = dto.copies;
        if (dto.files !== undefined) entity.files = dto.files;
        if (dto.userComment !== undefined) entity.userComment = dto.userComment ?? null;

        // Сбрасываем статус в «Новая» — администратор увидит повторную заявку
        entity.status = "Новая";
        entity.adminComment = null;
        entity.statusHistory = [
            ...(entity.statusHistory ?? []),
            { status: "Новая", date: new Date().toISOString(), comment: "Заявка доработана" },
        ];

        return this.repo.save(entity);
    }

    async updateStatus(id: string, dto: UpdateStatusDto): Promise<CertificateRequest> {
        const entity = await this.repo.findOneBy({ id });
        if (!entity) throw new NotFoundException("Заявка не найдена");

        if (STATUSES_REQUIRING_COMMENT.includes(dto.status) && !dto.adminComment) {
            throw new BadRequestException(
                `При переводе в статус «${dto.status}» необходимо заполнить adminComment`,
            );
        }

        entity.status = dto.status;
        if (dto.adminComment !== undefined) entity.adminComment = dto.adminComment;

        const historyEntry: StatusHistoryEntry = {
            status: dto.status,
            date: new Date().toISOString(),
            ...(dto.adminComment ? { comment: dto.adminComment } : {}),
        };
        entity.statusHistory = [...(entity.statusHistory ?? []), historyEntry];

        return this.repo.save(entity);
    }

    async deleteByUser(id: string, userId: string): Promise<void> {
        const entity = await this.repo.findOneBy({ id, userId });
        if (!entity) throw new NotFoundException("Заявка не найдена");
        if (entity.status !== "Новая") {
            throw new ForbiddenException("Отменить можно только заявку со статусом «Новая»");
        }
        await this.repo.remove(entity);
    }

    /** Удаление администратором — без ограничений по статусу */
    async deleteByAdmin(id: string): Promise<void> {
        const entity = await this.repo.findOneBy({ id });
        if (!entity) throw new NotFoundException("Заявка не найдена");
        await this.repo.remove(entity);
    }
}
