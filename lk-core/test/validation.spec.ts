import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import axios from "axios";
import { moduleMetadata } from '../src/app.module';
import * as jwt from "jsonwebtoken";
import secretForTests from '../src/secretForTests';
import { faker } from '@faker-js/faker/locale/ru';
import { DescriptionFormat } from '../src/format/description-format';
import APIService from '../src/services/api.service';
import ResponseService from '../src/services/response.service';
import AdminService from '../src/services/admin.service';
import { calculateDescriptionFormatHash } from '../src/calculateDFHash';

type user = {
  name: string,
  token: string
}

const submitters = Array(3).fill(0).map(() => faker.internet.userName());

const df: DescriptionFormat = {
    fields: {
        specialFields: [
            "status",
            "formSubmissionDateTime",
            "formSubmissionUser",
        ],
        formFields: [
            {
                name: "title",
                type: "string",
                required: true
            },
            {
                name: "check",
                type: "bool",
            },
            {
                name: "aNumber",
                type: "number",
            },
            {
                name: "mail",
                type: "string",
            },
        ]
    },
};

//TODO: сделать вытаскивание из массива сразу в тип, если это возможно
type tdf = {title?: any, check?: any, aNumber?: any, mail?: any}

describe('(e2e)', () => {
    let app: INestApplication;
    let module: TestingModule;
    let url: string;
    const formName = "Responses";

    let serviceService: APIService;
    let responseService: ResponseService;
    let adminService: AdminService;

    let users: user[];
    let serviceKey: string;

    afterAll(async () => {
        await app?.close(); await module?.close();
    });
    beforeAll(async () => {
        module = await Test.createTestingModule(moduleMetadata({
            useJWT: true,
            useJwtStrategy: false,
            descriptionFormat: {df, fileName: formName},
            databaseName: calculateDescriptionFormatHash(df)
        })).compile();
        app = module.createNestApplication();
        await app.init();
        url = request(app.getHttpServer()).get("").url;

        serviceService = module.get(APIService);
        adminService = module.get(AdminService);

        users = submitters.map(x => {return {
            name: x,
            token: jwt.sign({ user: {person: {id: x}} }, secretForTests)
        };});

        // @ts-expect-error: private
        adminService.roles.set(users[0].name, [{user: users[0].name, service: "lk-contacts-admin", role: "admin", context: null}]);

        serviceKey = await axios.post(`${url}/admin/${formName}/api`, undefined, {headers: {"Authorization": `Bearer ${users[0].token}`}}).then(res => res.data.authKey);
    });

    it("Not Empty title", async() => {
        const post = (data: tdf) => axios.post(`${url}/api/${formName}/submissions`, data, {headers: {"Auth-Key": serviceKey}});

        await expect(post({title: "required", aNumber: 123, check: true, mail: "dsadasd"})).resolves.toBeDefined();
        //TODO await expect(post({title: "required", aNumber: "123", check: true, mail: "dsadasd"})).resolves.toBeDefined();
        //TODO await expect(post({title: "required", aNumber: "123", check: "true", mail: "dsadasd"})).resolves.toBeDefined();
        await expect(post({title: "required"})).resolves.toBeDefined();
        //Лучше конечно возвращать описание ошибки, а не просто код, но я не помню, как проверить сообщение ошибки
        //Попробуй просто вызвать throw new BadRequestException("тут текст")
        //Текст придумаем позже
        await expect(post({})).rejects.toThrow("400");
        await expect(post({aNumber: 123321})).rejects.toThrow("400");
        await expect(post({aNumber: 123321, check: false, mail: "dasds"})).rejects.toThrow("400");
        await expect(post({aNumber: 123321, check: false, mail: "dasds", title: "ddss"})).resolves.toBeDefined();
    
        //Проверка типов
        await expect(post({title: "required", aNumber: "asd"})).rejects.toThrow("400");
        await expect(post({title: "required", aNumber: true})).rejects.toThrow("400");
        await expect(post({title: "required", aNumber: false})).rejects.toThrow("400");
        await expect(post({title: "required", check: "asd"})).rejects.toThrow("400");
        await expect(post({title: "required", check: "0"})).rejects.toThrow("400");
        await expect(post({title: "required", check: "1"})).rejects.toThrow("400");
        await expect(post({title: "required", check: "123"})).rejects.toThrow("400");
    });
});
