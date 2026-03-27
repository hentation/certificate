import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import axios from "axios";
import { moduleMetadata } from '../src/app.module';
import * as jwt from "jsonwebtoken";
import secretForTests from '../src/secretForTests';
import { faker } from '@faker-js/faker/locale/ru';
import { DescriptionFormat } from '../src/format/description-format';
import { getDataSourceToken } from '@nestjs/typeorm';
import AdminService from '../src/services/admin.service';
import { DataSource } from 'typeorm/data-source';
const random = () => faker.string.alphanumeric(16);

type user = {
  name: string,
  token: string
}

const submitters = Array(50).fill(0).map(() => faker.internet.userName());

const getRandomResponse = () => {
    return {
        submitter: faker.helpers.arrayElement(submitters),
        title: [faker.address.streetName(), faker.random.word(), faker.music.genre()].join(" "),
        "paper-number": Math.random() > 0.2 ? faker.finance.iban(true) : undefined,
        "time-period": faker.date.month() + " " + faker.date.recent().getFullYear(),
        eduComponent: Math.random() > 0.2 ? faker.company.bsNoun() : undefined,
        extra: faker.commerce.productDescription(),
        needsEventEscort: Math.random() > 0.2 ? Math.random() > 0.5 : undefined,
        responsiblePerson: faker.name.fullName(),
        contactPhone: faker.phone.number(),
        contactEmail: faker.internet.email(),
        eventAddress: faker.address.streetAddress(false)
    };
};

const df: DescriptionFormat = {
    app: {
        appTitle: "Регистрация мероприятий",
        appDescription: "Сервис lk-form на примере заявок на различные мероприятия. Этот пример показывает типичный use case: возможность приёма заявок от внешних пользователей, изменения модераторами и отображение конкретных заявок через API"
    },
    forms: {
    },
    fields: {
        specialFields: [
            "status",
            "formSubmissionDateTime",
            "formSubmissionUser",
        ],
        formFields: [
            {
                name: "title",
                title: "Заголовок мероприятия",
                type: "string",
                required: true
            },
            {
                name: "paper-number",
                title: "Номер договора",
                type: "string",
                visibleInSubmissionsView: false
            },
            {
                name: "time-period",
                title: "Период проведения мероприятия",
                type: "string",
                required: true
            },
            {
                name: "eduComponent",
                title: "Компонент образовательной программы",
                type: "string",
                visibleInSubmissionsView: false
            },
            {
                name: "needsEventEscort",
                title: "Необходимость в сопроводителе мероприятия",
                type: "bool",
                visibleInSubmissionsView: false
            },
            {
                name: "eventAddress",
                title: "Адрес проведения мероприятия",
                type: "string",
                visibleInSubmissionsView: false,
                required: true
            },
            {
                name: "contactInfo",
                title: "Информация для связи и уточнения деталей для проведения мероприятия",
                type: "info"
            },
            {
                name: "responsiblePerson",
                title: "ФИО ответственного за мероприятие",
                type: "string",
                visibleInSubmissionsView: false,
                required: true
            },
            {
                name: "contactPhone",
                title: "Телефон для связи",
                type: "string",
                visibleInSubmissionsView: false
            },
            {
                name: "contactEmail",
                title: "Email для связи",
                type: "string",
                visibleInSubmissionsView: false,
                required: true
            },
            {
                name: "extra",
                title: "Дополнительная информация",
                type: "string",
                appearance: "long",
                visibleInSubmissionsView: false
            },
        ]
    },
};

describe.skip('(e2e)', () => {
    let app: INestApplication;
    let module: TestingModule;
    let url: string;
    const formName = "too-many-requests";

    let adminService: AdminService;

    const user: user = { name: random(), token: "" };

    afterAll(async () => {
        await app?.close(); await module?.close();
    });
    beforeAll(async () => {
        module = await Test.createTestingModule(moduleMetadata({
            useJWT: true,
            useJwtStrategy: false,
            descriptionFormat: {df, fileName: formName},

            databaseName: process.env.DB_NAME
        })).compile();
        app = module.createNestApplication();
        await app.init();
        url = request(app.getHttpServer()).get("").url;

        adminService = module.get(AdminService);

        user.token = jwt.sign({ user: { person: { id: user.name } } }, secretForTests);

        // @ts-expect-error: private
        adminService.admins.add(user.name);
    
        const resp: DataSource = module.get(getDataSourceToken());
        await resp.createQueryBuilder().from(formName, "r").delete().execute();
    });

    it("response creator", async () => {
        const serviceKey = await axios.post(`${url}/admin/${formName}/api`, undefined, { headers: { "Authorization": `Bearer ${user.token}` } }).then(res => res.data.authKey);
        expect(serviceKey).toBeDefined();

        const chunkSize = 200;
        const numberOfSubmissions = 10_000;
        for (let i = 0; i < numberOfSubmissions; i += chunkSize) {
            await Promise.all([
                ...Array(Math.min(chunkSize, numberOfSubmissions - i)).fill(0).map(async () =>
                    await expect(axios.post(`${url}/api/${formName}/submissions`, getRandomResponse(),
                        { headers: { "Auth-Key": serviceKey } })).resolves.toBeDefined()),
            ]);
        }
    }, 100_000);
});
