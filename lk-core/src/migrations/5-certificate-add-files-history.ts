import { MigrationInterface, QueryRunner } from "typeorm";

export class certificateAddFilesHistory1711234567891 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "certificate_requests"
            ADD COLUMN IF NOT EXISTS "files" jsonb NOT NULL DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS "statusHistory" jsonb NOT NULL DEFAULT '[]'::jsonb;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "certificate_requests"
            DROP COLUMN IF EXISTS "files",
            DROP COLUMN IF EXISTS "statusHistory";
        `);
    }
}

