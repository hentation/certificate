import { Injectable, Logger } from "@nestjs/common";
import { DescriptionFormat } from "../format/description-format";
import { transformAndValidate } from "class-transformer-validator";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Table, TableColumn } from "typeorm";
import { Postgres14 } from "typeorm-information-schema";
import TypeHandler from "./TypeHandler";
import { compactValidationError } from "./helpers/compactValidationError";
import DescriptionFile from "src/entity/DescriptionFile";
import { Repository } from "typeorm/repository/Repository";
import { importFromString } from "module-from-string";
import { SqlString } from "src/SqlStringWrapper";

@Injectable()
export class FormatService {
    constructor(
        @InjectDataSource() private ds: DataSource,
        @InjectRepository(DescriptionFile) private descFiles: Repository<DescriptionFile>,
    ) { }
    public pathToFiles: string;
    public format = new Map<string, DescriptionFormat>();
    private readonly logger = new Logger(FormatService.name);

    getAvailableForms() {
        return [...this.format.entries()].map(x => { return { id: x[0], name: x[1].app?.appTitle }; });
    }

    doesFormExist(formName: string) {
        return this.format.has(formName);
    }

    isFormPublic(formName: string) {
        return Boolean(this.format.get(formName)?.forms?.isPublic);
    }

    getAllFields(formName: string) {
        return this.format.get(formName)?.fields;
    }

    async hasField(formName: string, fieldName: string) {
        const column = (await this.getCurrentColumns(formName)).find(x => x.column_name == fieldName);
        if (column == null)
            return false;

        const specialColumns = ["timestamp", "submitter", "status", "moderatorFeedback"];
        if (specialColumns.includes(fieldName))
            return true;

        const fields = this.getAllFields(formName);
        return fields?.formFields?.map(f => f.name).includes(fieldName) ||
            fields?.specialFields?.map(f => f.toString()).includes(fieldName);
    }

    getField(formName: string, fieldName: string) {
        const fields = this.getAllFields(formName);
        return fields?.formFields?.find(f => f.name == fieldName) ?? fields?.specialFields?.find(f => f == fieldName);
    }

    getFieldsForSubmission(formName: string) {
        return this.format.get(formName)?.fields?.formFields;
    }

    getFieldsForView(formName: string) {
        const result = [...(this.format.get(formName)?.fields?.formFields ?? [])];
        const sf = this.format.get(formName)?.fields?.specialFields;
        if (sf?.includes("formSubmissionUser"))
            result?.push({ name: "submitter", type: "string", title: "Отправитель заявки", visibleInSubmissionsView: true });
        if (sf?.includes("formSubmissionDateTime"))
            result?.push({ name: "timestamp", type: "date", title: "Время подачи заявки", visibleInSubmissionsView: true });
        if (sf?.includes("status"))
            result?.push({ name: "status", type: "string", title: "Статус заявки", visibleInSubmissionsView: true });
        if (sf?.includes("moderatorFeedbackToSubmission"))
            result?.push({name: "moderatorFeedback", type: "string", title: "Ответ модератора", visibleInSubmissionsView: true});
        return result;
    }

    getAppInfo(formName: string) {
        return this.format.get(formName)?.app;
    }

    async Init(df?:  {df: DescriptionFormat, fileName: string}) {
        await this.loadDescriptionFormat(df);
    }

    async loadDescriptionFormat(df?:  {df: DescriptionFormat, fileName: string}) {
        const initialImport: { fileName: string, df: DescriptionFormat }[] = [];
        if (df) initialImport.push(df);
        else {
            const files = await this.descFiles.find();
            for (const file of files) {
                try {
                    try {
                        const i = JSON.parse(file.content);
                        initialImport.push({ fileName: file.name, df: i});
                    } catch {
                        const i = await importFromString(file.content);
                        await this.descFiles.update({ name: file.name }, {content: i});
                        initialImport.push({ fileName: file.name, df: i });
                    }
                } catch (e) {
                    this.logger.error(e);
                }
            }

            this.pathToFiles = __dirname + (__dirname.includes("dist") ? "/.." : "") + "/../../description-files/";
            const fs = await import('fs');
            const path = await import("path");
            const localFiles = fs.existsSync(this.pathToFiles) ? fs.readdirSync(this.pathToFiles).map(x => `${this.pathToFiles}/${x}`) : [];

            if (process.env.LOAD_SAMPLE_FORMS) {
                const sampleFolder = __dirname + (__dirname.includes("dist") ? "/.." : "") + "/../../description-files-example/";
                localFiles.push(...(fs.existsSync(sampleFolder) ? fs.readdirSync(sampleFolder).map(x => `${sampleFolder}/${x}`) : []));
            }

            for (const file of localFiles.filter(x => x.endsWith(".json"))) {
                try {
                    const i = await import(file);
                    initialImport.push({ fileName: path.basename(file).split(".")[0], df: i });
                } catch (e) {
                    this.logger.error(e);
                }
            }

        }

        for (const descFile of initialImport) {
            await transformAndValidate(DescriptionFormat, descFile.df, { validator: { whitelist: true } }).then(o => {
                this.format.set(descFile.fileName, o);
            })
                .catch(e => {
                    //TODO: сделать более короткий вывод при нарушении спецификации описывающего файла
                    this.logger.error(`The ${descFile.fileName} provided didn't meet the format, please make sure it's a valid DescriptionFormat object.`, compactValidationError(e));
                });
        }

        for (const table of this.format.keys())
            await this.prepareDBTable(table);
    }

    async seekColumnsUnlikeDescriptionFileUpdateTable(formName: string, currentTableColumns: Postgres14.InformationSchema.Columns[]) {
        if (!this.format.get(formName)?.fields?.formFields?.length) {
            this.logger.warn(`The loaded ${formName} has no custom form field specified.`);
            return;
        }

        if (this.format.get(formName)?.fields?.specialFields?.length) {
            const sf = this.format.get(formName)?.fields?.specialFields;
            if (sf?.includes("formSubmissionUser"))
                await this.addColumnsToTable(formName, new Map([["submitter", "text"]]));
            if (sf?.includes("formSubmissionDateTime"))
                await this.addColumnsToTable(formName, new Map([["timestamp", "timestamptz"]]));
            if (sf?.includes("status"))
                await this.addColumnsToTable(formName, new Map([["status", "text"]]));
            if (sf?.includes("moderatorFeedbackToSubmission"))
                await this.addColumnsToTable(formName, new Map([["moderatorFeedback", "text"]]));
        }

        const excessColumns = currentTableColumns.filter(el => !this.format.get(formName)?.fields?.formFields?.some(col => col.name == el.column_name));
        if (excessColumns.length) {
            this.logger.warn(`The database structure is not in sync with the ${formName}: excess columns.`);
            this.logger.warn("You should check the data in the database and decide to keep the column or to not.");
            this.logger.warn(`List of excess columns: ` + excessColumns.map(x => `[${x.column_name}]`).join(" "));
        }

        const missingColumns = this.format.get(formName)?.fields?.formFields?.filter(el => !currentTableColumns.some(col => col.column_name == el.name));
        if (missingColumns?.length) {
            this.logger.log(`The database structure is not in sync with the ${formName}: missing columns. Updating ${formName} table.`);
            await this.addColumnsToTable(formName, new Map(missingColumns.map(field => [field.name, TypeHandler[field.type as keyof typeof TypeHandler].dbType])));
        }
    }

    async addColumnsToTable(tableName: string, columns: Map<string, string>) {
        let query = `ALTER TABLE "${SqlString.escapeId(tableName)}" `;
        const last = [...columns][columns.size - 1][0];
        columns.forEach((type, name) => query += `ADD COLUMN IF NOT EXISTS "${SqlString.escapeId(name)}" ${SqlString.escapeId(type)}${name === last ? ';' : ','} `);
        await this.ds.query(query);
    }

    async getCurrentColumns(formName: string) {
        return (await this.ds.createQueryBuilder().select().from("information_schema.columns", "col").where({table_name: formName}).execute() as Postgres14.InformationSchema.Columns[])
            .filter(x => x.column_name !== "id");
    }

    async prepareDBTable(formName: string) {
        const runner = this.ds.createQueryRunner();
        await runner.createTable(new Table({
            name: SqlString.escapeId(formName),
            columns: [
                new TableColumn({
                    name: "id",
                    type: "uuid",
                    default: "gen_random_uuid()",
                    isPrimary: true,
                }),
            ]
        }), true);

        await runner.release();

        const currentTableColumns = await this.getCurrentColumns(formName);

        await this.seekColumnsUnlikeDescriptionFileUpdateTable(formName, currentTableColumns);
    }
}