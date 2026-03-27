import { Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { MINIO_CONNECTION } from "nestjs-minio";
import { Client } from 'minio';
import internal from "stream";

@Injectable()
export class MinioService {
    constructor(
        @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
    ) {}

    logger = new Logger(MinioService.name);

    async upload(filename: string, folder: string, fileBuffer: Buffer, mimetype: string) {
        if (!process.env.MINIO_BUCKET) 
            throw new InternalServerErrorException("env MINIO_BUCKET not set");

        return this.minioClient.putObject(
            process.env.MINIO_BUCKET,
            `${folder}/${filename}`,
            fileBuffer,
            undefined,
            {
                'Content-type': mimetype,
            }
        );
    }

    // async remove(filename: string, folder: string) {
    //     if (!process.env.MINIO_BUCKET) 
    //         throw new InternalServerErrorException("env MINIO_BUCKET not set");

    //     return this.minioClient.removeObject(
    //         process.env.MINIO_BUCKET,
    //         `${folder}/${filename}`,
    //     );
    // }

    async getObject(filename: string, folder: string) {
        if (!process.env.MINIO_BUCKET) 
            throw new InternalServerErrorException("env MINIO_BUCKET not set");

        const stat = await this.minioClient.statObject(
            process.env.MINIO_BUCKET,
            `${folder}/${filename}`
        );

        const object =  await this.minioClient.getObject(
            process.env.MINIO_BUCKET,
            `${folder}/${filename}`,
        );

        return {stat, object};
    }

    async readChunks(readable: internal.Readable): Promise<Uint8Array> {
        return new Promise((res, rej) => {

            const chunks: Uint8Array[] = [];
            
            readable.on('readable', () => {
                let chunk;
                while (null !== (chunk = readable.read())) {
                    chunks.push(chunk);
                }
            });
            
            readable.on('end', () => {
                const result = new Uint8Array((chunks.reduce((a, b) => a + b.length, 0)));
                let shift = 0;
                for (const chunk of chunks) {
                    result.set(chunk, shift);
                    shift += chunk.length;
                }
                res(result);
            });
            
            readable.on('error', err => {
                this.logger.error(err);
                throw new InternalServerErrorException();
            });
        });
    }
}