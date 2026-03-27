import { MigrationInterface, QueryRunner } from "typeorm";

export class serviceTable1669214915488 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`create table "_services" ("authKey" varchar(40)  not null primary key, comment text);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop table "_services";`);
    }
}