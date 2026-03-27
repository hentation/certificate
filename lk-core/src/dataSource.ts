import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import migationList from "./migrations/_migrations";
import entityList from "./entity/_entities";
import newProfileEntityList from "./newProfileEntities/_entities";
require('dotenv').config();

export const getDS = (dbName?: string) => {
    const options: PostgresConnectionOptions = {
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? "5432"),
        database: dbName ?? process.env.DB_NAME,
        username: process.env.DB_USER,
        logging: process.env.DB_LOG === "1",
        password: process.env.DB_PASSWORD,
        migrations: migationList,
        entities: entityList,
        applicationName: "certificate-service",
        migrationsRun: true,
        migrationsTableName: "_migrations"
    };

  return { options, ds: new DataSource(options) }
}

export const getNewProfileDS = () => {
  const options: PostgresConnectionOptions = {
    name: 'newProfileConnection',
    type: "postgres",
    host: process.env.NEWPROFILE_DB_HOST,
    port: parseInt(process.env.NEWPROFILE_DB_PORT ?? "5432"),
    database: process.env.NEWPROFILE_DB_NAME,
    username: process.env.NEWPROFILE_DB_USER,
    logging: process.env.DB_LOG === "1",
    password: process.env.NEWPROFILE_DB_PASSWORD,
    entities: newProfileEntityList,
    applicationName: "certificate-service",
    migrationsRun: false,
  }

  return { options, ds: new DataSource(options) }
}
