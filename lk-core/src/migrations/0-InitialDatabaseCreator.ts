import { DynamicModule, Module } from "@nestjs/common";
import { Client } from "pg";
import { getDS } from "../dataSource";

@Module({})
export class InitialDatabaseCreator {
    static async register(databaseName?: string): Promise<DynamicModule> {
        const options = getDS(databaseName).options;
        const client: Client = new Client({
            host: options.host,
            port: options.port,
            user: options.username,
            password: options.password
        });
        
        await client.connect();
        const a = await client.query(`SELECT datname FROM pg_database WHERE datname = '${options.database}'`);
        if (a.rowCount == 0) await client.query(`CREATE DATABASE "${options.database}"`);
        await client.end();

        return {module: InitialDatabaseCreator};
    }
}