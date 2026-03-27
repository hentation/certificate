import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CertificateRequest } from "./CertificateRequest.entity";
import { CertificateService } from "./certificate.service";
import { CertificateController } from "./certificate.controller";
import { CertificateAdminController } from "./certificate-admin.controller";

@Module({
    imports: [TypeOrmModule.forFeature([CertificateRequest])],
    providers: [CertificateService],
    controllers: [CertificateController, CertificateAdminController],
})
export class CertificateModule {}
