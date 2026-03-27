import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("User")
@Controller("user")
export class UserController {
    @ApiOperation({
        summary: "Роли текущего пользователя",
        description:
            "Возвращает набор ролей для фронтенда. " +
            "При USE_MOCK_AUTH=1 всегда отдаёт isCertificateUser=true.",
    })
    @Get("roles")
    getRoles() {
        return {
            isCertificateUser: true,
            isParticipant:     false,
            isModerator:       false,
            isExpert:          false,
            isOrganizer:       false,
            isAuditor:         false,
        };
    }
}
