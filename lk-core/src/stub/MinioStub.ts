import { Module } from "@nestjs/common";
import { MINIO_CONNECTION } from "nestjs-minio";

const providers = [
    {
        provide: MINIO_CONNECTION,
        useValue: null,
    }
];

@Module({
    providers: providers,
    exports: providers,
})
export class MinioStub {}