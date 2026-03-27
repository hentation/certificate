import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class shortener1697444932209 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "_shortener",
            columns: [
                {name: "short", type: "varchar(40)", isPrimary: true, isNullable: false},
                {name: "target", type: "varchar(40)", isPrimary: true, isNullable: false},
            ],
            uniques: [
                {columnNames: ["short"]},
                {columnNames: ["target"]}
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop table "_shortener";`);
    }
}