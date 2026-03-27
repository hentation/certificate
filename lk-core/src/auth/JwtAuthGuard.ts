import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "./public";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    constructor(
        private readonly reflector: Reflector,
        private readonly jwt: JwtService
    ) { super(); }

    canActivate(context: ExecutionContext) {
        if (this.reflector.get(GUARDS_METADATA, context.getHandler()))
            return true;
        if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]))
            return true;

        // Заглушка для локальной разработки без реального Keycloak.
        // Включается переменной USE_MOCK_AUTH=1 в .env
        // Фронтенд может передать реальный userId через заголовок x-user-id,
        // иначе используется MOCK_USER_ID из .env как запасной вариант.
        if (process.env.USE_MOCK_AUTH === "1") {
            const request = context.switchToHttp().getRequest();
            const headerUserId = request.headers["x-user-id"];
            request.user = headerUserId || process.env.MOCK_USER_ID || "test-user-id";
            return true;
        }

        return super.canActivate(context);
    }
}