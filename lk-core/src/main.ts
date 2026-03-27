import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { json } from 'express';

export default async function bootstrap(nestPort?: number) { 
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({whitelist: true}));
    app.use(json({ limit: '6mb' }));

    if (process.env.ENABLE_SWAGGER === "1") {
        const config = new DocumentBuilder()
            .addApiKey({type: "apiKey", in: "header", name: "Auth-Key", description: "API-ключ вашего приложения от LK-Form"}, "API Auth-Key")
            .addBearerAuth({type: "http", description: "JWT Bearer токен от Keycloak (чувствителен к realm)"}, "Токен Keycloak")
            .build();
        const document = SwaggerModule.createDocument(app, config, {
            deepScanRoutes: true,
        });
        SwaggerModule.setup("docs", app, document);
    }

    if (process.env.CORS === "1") {
        app.enableCors({
            // Явно перечисляем все локальные адреса фронтенда.
            origin: [
                "http://localhost:8080",
                "http://localhost:5173",
                "http://127.0.0.1:8080",
                "http://127.0.0.1:5173",
            ],
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
            credentials: true,
        });
    }
    await app.listen(nestPort as number);
    return app;
}

// Stryker disable next-line all
if (require.main === module)
    void bootstrap(3000);
