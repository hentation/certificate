import { Module, ModuleMetadata, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { EndUserController } from './api/user/info.controller';
import { ApiController } from './api/api/api.controller';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/JwtAuthGuard';
import { getDS, getNewProfileDS } from './dataSource';
import { InitialDatabaseCreator } from './migrations/0-InitialDatabaseCreator';
import { FormatModule } from './format/module';
import APIService from './services/api.service';
import ResponseService from './services/response.service';
import { DescriptionFormat } from './format/description-format';
import { AdminController } from './api/admin/admin.controller';
import { ResponseController } from './api/user/response.controller';
import AdminService from './services/admin.service';
import { FormController } from './api/user/form.controller';
import { FormService } from './services/form.service';
import { LKRoleService } from "src/auth/lk-role.service";
import { CacheService } from './auth/CacheService';
import entityList from './entity/_entities';
import ShortenerService from './services/shortener';
import { ShortenerController } from './api/admin/shortener';
import newProfileEntityList from './newProfileEntities/_entities';
import { ApiInfoController } from './api/api/api-info.controller';
import { LkNotificationService } from './services/notification.service';
import { SchedulerService } from './services/scheduler.service';
import "dotenv/config";
import { ScheduleModule } from '@nestjs/schedule';
import { PublicFormController } from './api/public/form.controller';
import { PublicEndUserController } from './api/public/info.controller';
import { PublicResponseController } from './api/public/response.controller';
import { NestMinioModule } from "nestjs-minio";
import { MinioStub } from './stub/MinioStub';
import { MinioService } from './services/minio.service';
import { CertificateModule } from './certificate/certificate.module';
import { UserModule } from './user/user.module';

export const moduleMetadata = (params?: {
  useJWT?: boolean,
  useJwtStrategy?: boolean
  descriptionFormat?: {df: DescriptionFormat, fileName: string},
  databaseName?: string
}): ModuleMetadata => {
    params = {
        useJWT: true,
        useJwtStrategy: true,
        ...params
    };
    const providers: Provider[] = [
        APIService,
        ResponseService,
        AdminService,
        FormService,
        LKRoleService,
        CacheService,
        ShortenerService,
        LkNotificationService,
        SchedulerService,
        MinioService,
    ];
    if (params.useJWT) providers.push({ provide: APP_GUARD, useClass: JwtAuthGuard });

    return {
        controllers: [
            ApiController,
            EndUserController,
            AdminController,
            ResponseController,
            FormController,
            ShortenerController,
            ApiInfoController,

            PublicFormController,
            PublicEndUserController,
            PublicResponseController,
        ],
        imports: [
            InitialDatabaseCreator.register(params.databaseName),
            TypeOrmModule.forRoot(getDS(params.databaseName).options),
            TypeOrmModule.forRoot(getNewProfileDS().options),
            TypeOrmModule.forFeature(entityList),
            TypeOrmModule.forFeature(newProfileEntityList, 'newProfileConnection'),
            AuthModule.register(params.useJwtStrategy),
            JwtModule.register({}),
            FormatModule.register(params.descriptionFormat),
            ScheduleModule.forRoot(),
            process.env.USE_MINIO === "1" ? NestMinioModule.register(
                {
                    isGlobal: true,
                    endPoint: process.env.MINIO_ENDPOINT!,
                    port: parseInt(process.env.MINIO_PORT!),
                    useSSL: true,
                    accessKey: process.env.MINIO_ACCESS_KEY!,
                    secretKey: process.env.MINIO_SECRET_KEY!,
                }) : MinioStub,
            CertificateModule,
            UserModule,
        ],
        providers: providers
    };
};

@Module(moduleMetadata())
export class AppModule { }
