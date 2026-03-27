import { MigrationInterface, QueryRunner } from "typeorm";

export class DescriptionFiles1669214915487 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`create table "_description_files" (name varchar(40) not null primary key, content text);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop table "_description_files";`);
    }
}