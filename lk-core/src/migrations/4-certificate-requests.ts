import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class certificateRequests1711234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "certificate_requests",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isNullable: false,
                        default: "gen_random_uuid()",
                    },
                    {
                        name: "userId",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "certificateType",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "purpose",
                        type: "varchar",
                        isNullable: false,
                        default: "'По месту требования'",
                    },
                    {
                        name: "copies",
                        type: "int",
                        isNullable: false,
                        default: 1,
                    },
                    {
                        name: "status",
                        type: "varchar",
                        isNullable: false,
                        default: "'Новая'",
                    },
                    {
                        name: "adminComment",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamptz",
                        isNullable: false,
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamptz",
                        isNullable: false,
                        default: "now()",
                    },
                ],
                indices: [
                    { columnNames: ["userId"] },
                    { columnNames: ["status"] },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "certificate_requests";`);
    }
}
