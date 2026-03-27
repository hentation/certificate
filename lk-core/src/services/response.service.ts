import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository,  } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FormatService } from "../format/FormatService";
import { DataSource } from "typeorm";
import { SelectQueryBuilder } from "typeorm/query-builder/SelectQueryBuilder";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";
import { Contacts } from "src/newProfileEntities/contacts";
import { SqlString } from "src/SqlStringWrapper";
import { ResponseClean } from "src/entity/Response";
import { z } from "zod";
import { LkNotificationService } from "./notification.service";
import { MinioService } from "./minio.service";
import { fileTypeValidator } from "src/format/TypeHandler";
import { safeParseJSON } from "src/format/helpers/safeParseJson";

@Injectable()
export default class ResponseService {
    constructor(
        @InjectDataSource() private readonly ds: DataSource,
        private readonly format: FormatService,
        @InjectRepository(Contacts, 'newProfileConnection')
        private readonly contacts: Repository<Contacts>,
        private readonly notifications: LkNotificationService,
        private readonly minioService: MinioService,
    ) { }

    async getOneById(formName: string, id: string): Promise<ResponseClean> {
        if (!this.format.doesFormExist(formName)) throw new NotFoundException("Форма не найдена");
        const result = await this.ds.createQueryBuilder().select("*").from(SqlString.escapeId(formName), "r").where({id}).getRawOne<ResponseClean>();
        if (result == null) throw new NotFoundException("Could not get form with given id. Form with this id doesn't exist or given id is invalid.");
        else return result;
    }

    async getOneByIdAndUser(formName: string, user: string, id: string): Promise<ResponseClean> {
        if (!this.format.doesFormExist(formName)) throw new NotFoundException("Форма не найдена");
        const result = await this.ds.createQueryBuilder().select("*").from(SqlString.escapeId(formName), "r").where({id, submitter: user}).getRawOne<ResponseClean>();
        if (result == null) throw new NotFoundException("Could not get form with given id. Form with this id doesn't exist or given id is invalid.");
        else return result;
    }

    async getMany(formName: string,
        skip?: number,
        take?: number,
        asc?: boolean,
        orderBy?: string,
        search?: string
    ): Promise<{ data: ResponseClean[], count: number }> {
        if (!this.format.doesFormExist(formName)) throw new NotFoundException("Форма не найдена");
        const query = this.ds.createQueryBuilder().select("*").from(SqlString.escapeId(formName), "r");
        return this._getMany(formName, query, skip, take, asc, orderBy, search);
    }

    async getManyByUser(formName: string,
        user: string,
        skip?: number,
        take?: number,
        asc?: boolean,
        orderBy?: string,
        search?: string
    ): Promise<{ data: ResponseClean[], count: number }> {
        if (!this.format.doesFormExist(formName)) throw new NotFoundException("Форма не найдена");
        if (!await this.format.hasField(formName, "submitter")) {
            return {data: [], count: 0};
        }
        const query = this.ds.createQueryBuilder().select("*").from(SqlString.escapeId(formName), "r").where({submitter: user});
        return this._getMany(formName, query, skip, take, asc, orderBy, search);
    }

    private async _getMany(formName: string,
        query: SelectQueryBuilder<ObjectLiteral>,
        skip?: number,
        take?: number,
        asc?: any,
        orderBy?: string,
        search?: string
    ): Promise<{ data: Record<string, string>[], count: number }> {
        if (search) {
            const StringRecord = z.record(z.string(), z.string().or(z.number()).or(z.boolean()));
            const searchJson = StringRecord.safeParse(JSON.parse(search));
            if (searchJson.success) {
                for (const [key, value] of Object.entries(searchJson.data)) {
                    if (await this.format.hasField(formName, key)) {
                        const k = SqlString.escapeId(key);
                        // FIXME
                        if ((this.format.getField(formName, k) as any)?.type === "date" || k === "timestamp") {
                            query.andWhere(`"${k}"::date = :${k}`, {[k]: value});
                        } else {
                            query.andWhere(`"${k}" ILIKE :${k}`, {[k]: `%${value}%`});
                        }
                    }
                }
            }
        }

        const count = query.clone();

        query = query.skip(skip ?? 0);
        if (take) query = query.take(take);

        let orderByColumn = 'timestamp';
        if (!await this.format.hasField(formName, orderByColumn))
            orderByColumn = `"${this.format.getFieldsForView(formName)[0].name}"`;
        if (orderBy && (await this.format.hasField(formName, orderBy)))
            orderByColumn = `"${orderBy}"`;
        
        if (asc == false || asc == "false")
            query = query.orderBy(orderByColumn, 'DESC');
        else query = query.orderBy(orderByColumn, 'ASC');

        return {
            data: await query.getRawMany(),
            //Мы не можем использовать getCount, так как он пытается
            //получить метаданные таблицы из класса, которого нет.
            count: (await count.getRawMany()).length
        };
    }

    async delete(formName: string, id: string) {
        if (!this.format.doesFormExist(formName)) throw new NotFoundException("Форма не найдена");
        return this.ds.createQueryBuilder().delete().from(SqlString.escapeId(formName), "r").where({id}).execute();
    }

    async deleteByUser(formName: string, user: string, id: string) {
        if (!this.format.doesFormExist(formName)) throw new NotFoundException("Форма не найдена");
        return this.ds.createQueryBuilder().delete().from(SqlString.escapeId(formName), "r").where({id, submitter: user}).execute();
    }

    private preHandleHandle(data: ResponseClean, finalFields: string[], key: string, value: string | number | boolean): void {
        data[key] = value;
        finalFields.push(key);
    }

    public async getSubmitter(formName: string, id: string) {
        if (!this.format.doesFormExist(formName)) throw new NotFoundException("Форма не найдена");
        const response = await this.getOneById(formName, id);
        return response.submitter;
    }

    private preHandleResponse(formName: string, data: ResponseClean, fields: string[], submitter?: string) {
        const sf = this.format.getAllFields(formName)?.specialFields;
        if (sf?.includes("formSubmissionUser"))
            this.preHandleHandle(data, fields, "submitter", submitter ?? data.submitter);
        if (sf?.includes("formSubmissionDateTime"))
            this.preHandleHandle(data, fields, "timestamp", new Date().toISOString());
        if (sf?.includes("status"))
            this.preHandleHandle(data, fields, "status", data.status ?? "Не обработано");
        if (sf?.includes("moderatorFeedbackToSubmission"))
            this.preHandleHandle(data, fields, "moderatorFeedback", data.moderatorFeedback);
    }

    async create(formName: string, data: ResponseClean, submitter?: string) {
        if (!this.format.doesFormExist(formName)) throw new NotFoundException("Форма не найдена");
        if (formName === "contacts") {

            const prev = await this.ds.createQueryBuilder().select().from(SqlString.escapeId(formName), "form").where({
                status: "Не обработано",
                submitter: submitter,
                '"targetUserId"': data.targetUserId
            }).getRawOne<ResponseClean>();
            if (prev) return this.update(formName, prev.id as string, data);
        }
        
        const cleanData = {} as ResponseClean;
        const fields = this.format.getFieldsForView(formName);
        this.preHandleResponse(formName, data, fields.map(x => x.name), submitter);

        for (const field of fields) {
            if (data[field.name] !== undefined) {
                let value = data[field.name];

                if (field.type === "string") {
                    if (value.toString().length > 2500)
                        throw new BadRequestException(`Значение поля [${field.title ?? field.name}] слишком длинное, мах кол-во символов 2500`);
                }

                if (field.type === "file") {
                    const result = safeParseJSON<z.infer<typeof fileTypeValidator>>(value as string);
                    if (!result.success) continue;
                    if (!result.value.content) continue;
                    const uuid = crypto.randomUUID();
                    const id = uuid + "_" + result.value.name;
                    await this.minioService.upload(id, `form-attachments/${formName}`, Buffer.from(result.value.content, 'base64'), result.value.type);
                    value = JSON.stringify({
                        ...result.value,
                        content: undefined,
                        id,
                    });
                }

                cleanData[field.name] = value;
            }
        }

        if (Object.keys(cleanData).length == 0) return false;

        await this.ds.createQueryBuilder().insert().into(SqlString.escapeId(formName)).values(cleanData).execute();
        return true;
    }

    async downloadFile(response: ResponseClean, fieldName: string, formName: string) {
        let value = response[fieldName] as unknown;
        const parseResult = safeParseJSON<unknown>(value as string);
        value = parseResult.success ? parseResult.value : "";
        const zodParseResult = fileTypeValidator.safeParse(value);
        if (!zodParseResult.success) throw new InternalServerErrorException("Файл некорректен");
        if (!zodParseResult.data.id) throw new NotFoundException("Файл не найден");
        return {
            fileName: zodParseResult.data.id,
            contentType: zodParseResult.data.type,
            data: await this.minioService.getObject(zodParseResult.data.id, `form-attachments/${formName}`),
        };
    }

    async update(formName: string, id: string, data: ResponseClean) {
        if (!this.format.doesFormExist(formName)) throw new NotFoundException("Форма не найдена");
        const cleanData = {} as ResponseClean;
        const responseWithId = await this.ds.createQueryBuilder().select("*").from(SqlString.escapeId(formName), "r").where({id}).getRawOne<ResponseClean>();
        if (responseWithId == null)
            throw new NotFoundException("Form with this id doesn't exist or given id is invalid.");

        const fields = this.format.getFieldsForView(formName);
        this.preHandleResponse(formName, data, fields.map(x => x.name));

        for (const field of fields) {
            if (data[field.name] !== undefined) {
                const value = data[field.name];

                if (field.type === "string") {
                    if (value.toString().length > 2500)
                        throw new BadRequestException(`Значение поля [${field.title ?? field.name}] слишком длинное, мах кол-во символов 2500`);
                }

                if (field.type === "file") {
                    continue;
                }

                cleanData[field.name] = value;
            }
        }

        if (Object.keys(cleanData).length == 0) return false;

        await this.ds.createQueryBuilder().update(SqlString.escapeId(formName), cleanData).where({id}).execute();
        if (formName === "contacts") {
            await this.handleExternalUpdate({...responseWithId, ...cleanData});
        }
        return true;
    }

    async handleExternalUpdate(data: ResponseClean) {
        if (data["status"] === "Отклонен") {
            await this.notifications.sendEmail(
                "Заявка на изменение контактных данных отклонена",
                `<p>Ваша заявка на редактирование контактных данных отклонена.</p>
<p>Причина отклонения: ${data.moderatorFeedback}</p>
<br>
<p>Вы можете внести исправления и отправить заявку повторно на модерацию. Для уточнений по заполнению формы контактных данных можете обратиться к модератору справочника контактов по эл. почте: t.a.korolkova@urfu.ru</p>`,
                data.submitter as string
            );
        }

        if (data["status"] !== "Подтвержден") return;
        await this.contacts.upsert({
            userId: data.targetUserId as string,
            roleId: data.roleId as string,
            phone: data.phone_new as string,
            address: data.address_new as string,
            extraEmail: data.email_new as string,
            modifiedAt: () => "NOW()"
        }, ["userId", "roleId"]);
    }
}