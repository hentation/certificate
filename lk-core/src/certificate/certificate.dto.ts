import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { CERTIFICATE_STATUSES, CERTIFICATE_TYPES, CertificateStatus, CertificateType } from "./CertificateRequest.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "@nestjs/swagger";
import type { FileAttachment } from "./CertificateRequest.entity";

export class CreateCertificateDto {
    @ApiProperty({
        description: "Вид справки",
        enum: CERTIFICATE_TYPES,
        example: "О трудовой деятельности",
    })
    @IsIn(CERTIFICATE_TYPES)
    certificateType: CertificateType;

    @ApiPropertyOptional({
        description: "Цель получения",
        example: "По месту требования",
    })
    @IsOptional()
    @IsString()
    purpose?: string;

    @ApiPropertyOptional({
        description: "Количество экземпляров (1–10)",
        minimum: 1,
        maximum: 10,
        default: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    copies?: number;

    @ApiPropertyOptional({
        description: "Прикреплённые файлы (максимум 10)",
        type: [Object],
    })
    @IsOptional()
    @IsArray()
    files?: FileAttachment[];

    @ApiPropertyOptional({ description: "Комментарий заявителя" })
    @IsOptional()
    @IsString()
    userComment?: string;
}

/**
 * Все поля CreateCertificateDto становятся опциональными.
 * Пользователь может обновить любое из них при статусе «На доработке».
 */
export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {}

export class UpdateStatusDto {
    @ApiProperty({
        description: "Новый статус заявки",
        enum: CERTIFICATE_STATUSES,
        example: "В работе",
    })
    @IsIn(CERTIFICATE_STATUSES)
    status: CertificateStatus;

    @ApiPropertyOptional({
        description: "Комментарий администратора (обязателен при отклонении)",
        example: "Документы оформлены некорректно",
    })
    @IsOptional()
    @IsString()
    adminComment?: string;
}
