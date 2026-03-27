import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Put,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CertificateService } from "./certificate.service";
import { UpdateStatusDto } from "./certificate.dto";

/**
 * Эндпоинты для сотрудника, обрабатывающего заявки.
 * Защита на уровне роли Keycloak должна быть добавлена через guard
 * (аналогично adminService.isModerator в остальных контроллерах).
 */
@ApiTags("Справки — администратор")
@ApiBearerAuth("Токен Keycloak")
@Controller("admin/certificates")
export class CertificateAdminController {
    constructor(private readonly service: CertificateService) {}

    @ApiOperation({ summary: "Все заявки на справки" })
    @Get()
    findAll() {
        return this.service.findAll();
    }

    @ApiOperation({ summary: "Изменить статус заявки" })
    @Put(":id/status")
    updateStatus(
        @Param("id") id: string,
        @Body() dto: UpdateStatusDto,
    ) {
        return this.service.updateStatus(id, dto);
    }

    @ApiOperation({ summary: "Удалить заявку (только SYSTEM_ADMIN)" })
    @Delete(":id")
    @HttpCode(204)
    deleteAdmin(@Param("id") id: string) {
        return this.service.deleteByAdmin(id);
    }
}
