import { MigrationInterface, QueryRunner } from "typeorm";

export class certificateAddUserComment1711234567892 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "certificate_requests"
            ADD COLUMN IF NOT EXISTS "userComment" text NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "certificate_requests"
            DROP COLUMN IF EXISTS "userComment";
        `);
    }
}
