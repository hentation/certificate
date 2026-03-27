import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import axios from "axios";
import { moduleMetadata } from '../src/app.module';
import * as jwt from "jsonwebtoken";
import secretForTests from '../src/secretForTests';
import { faker } from '@faker-js/faker';
import { calculateDescriptionFormatHash } from '../src/calculateDFHash';
import { DescriptionFormat } from '../src/format/description-format';
import { Repository, DataSource } from 'typeorm';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import AdminService from '../src/services/admin.service';
import { Service } from '../src/entity/Service';
const random = () => faker.string.alphanumeric(16);

type user = {
  name: string,
  token: string
}

const df: DescriptionFormat = {
    app: {
        appTitle: "Оно работает"
    },
    forms: {
        enableFormSubmissionByAnyUser: true,
    // enableCustomView: "true"
    },
    fields: {
        specialFields: [
            "formSubmissionUser"
        ],
        formFields: [
            {
                name: "test",
                type: "string"
            },
            {
                name: "test2",
                type: "number",
                required: true
            },
            {
                name: "another-column",
                type: "string"
            }
        ]
    },
};

describe('(e2e)', () => {
    let app: INestApplication;
    let module: TestingModule;
    let url: string;
    const formName = "Responses";

    let adminService: AdminService;

    const u: user[] = Array(3).fill(0).map(() => { return { name: random(), token: "" }; });

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

        adminService = module.get(AdminService);

        const resp: DataSource = module.get(getDataSourceToken());
        await resp.createQueryBuilder().from("Responses", "r").delete().execute();
        const serv: Repository<Service> = module.get(getRepositoryToken(Service));
        await serv.createQueryBuilder().delete().execute();

        u.forEach(s => s.token = jwt.sign({ user: { person: { id: s.name } } }, secretForTests));

        // @ts-expect-error: private
        adminService.roles.set(u[2].name, [{user: u[2].name, service: "lk-contacts-admin", role: "admin", context: null}]);
    });

    it("dsa", async () => {
        const body = {
            "test": random(),
            "test2": 413,
            "another-column": random()
        };

        await expect(axios.post(`${url}/${formName}/submissions`, body)).rejects.toThrow("401");
        await expect(axios.get(`${url}/${formName}/submissions`)).rejects.toThrow("401");

        //Отправка от простого пользователя 1
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[0].token}` } })
            .then(res => expect(res.data.data).toHaveLength(0));
        await expect(axios.post(`${url}/${formName}/submissions`, { "test": random(), "test2": 413, "another-column": "ccc1" },
            { headers: { "Authorization": `Bearer ${u[0].token}` } })).resolves.toBeDefined();
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[0].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(1);
                //TODO: починить преобразование строк в числа
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything(), submitter: u[0].name });
            });

        //Отправка от простого пользователя 2
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[1].token}` } })
            .then(res => expect(res.data.data).toHaveLength(0));
        await expect(axios.post(`${url}/${formName}/submissions`, { "test": random(), "test2": 413, "another-column": "ccc1" },
            { headers: { "Authorization": `Bearer ${u[1].token}` } })).resolves.toBeDefined();
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[1].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(1);
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything(), submitter: u[1].name });
            });

        //Отправка админом через метод для простых пользователей
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[2].token}` } })
            .then(res => expect(res.data.data).toHaveLength(0));
        await expect(axios.post(`${url}/${formName}/submissions`, { "test": random(), "test2": 413, "another-column": "ccc1" },
            { headers: { "Authorization": `Bearer ${u[2].token}` } })).resolves.toBeDefined();
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[2].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(1);
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything(), submitter: u[2].name });
            });

        //Отправка от простого пользователя 2 ещё раз
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[1].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(1);
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything(), submitter: u[1].name });
            });
        await expect(axios.post(`${url}/${formName}/submissions`, { "test": random(), "test2": 777, "another-column": "ъуъ" },
            { headers: { "Authorization": `Bearer ${u[1].token}` } })).resolves.toBeDefined();
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[1].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(2);
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything(), submitter: u[1].name });
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "777", "another-column": "ъуъ", id: expect.anything(), submitter: u[1].name });
            });

        //При этом у других остаются свои заявки без изменений
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[0].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(1);
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything(), submitter: u[0].name });
            });
        //При этом у других остаются свои заявки без изменений
        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[2].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(1);
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything(), submitter: u[2].name });
            });

        //Добавить удаление пользователем своей заявки
        const submissionIdToRemove = await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[0].token}` } }).then(res => {
            return res.data.data[0].id;
        });

        await axios.delete(`${url}/${formName}/submissions/${submissionIdToRemove}`, { headers: { "Authorization": `Bearer ${u[0].token}` } });

        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[0].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(0);
            });

        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[1].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(2);
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything(), submitter: u[1].name });
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "777", "another-column": "ъуъ", id: expect.anything(), submitter: u[1].name });
            });

        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[2].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(1);
                expect(res.data.data).toContainEqual({ test: expect.anything(), submitter: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything() });
            });

        const submissionIdToUpdate = await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[1].token}` } }).then(res => {
            return res.data.data.filter((x: any) => x.test2 === "413")[0].id;
        });

        await axios.put(`${url}/${formName}/submissions/${submissionIdToUpdate}`,
            { test: "YourDearAdmin", test2: 666, "another-column": "bites-the-row" }, { headers: { "Authorization": `Bearer ${u[1].token}` } });

        await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[1].token}` } })
            .then(res => {
                expect(res.data.data).toHaveLength(2);
                expect(res.data.data).toContainEqual({ test: "YourDearAdmin", test2: "666", "another-column": "bites-the-row", id: expect.anything(), submitter: u[1].name });
                expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "777", "another-column": "ъуъ", id: expect.anything(), submitter: u[1].name });
            });

        /////////////////////////
        //Смотрим через админку//
        /////////////////////////

        //Просмотр всех
        await expect(axios.get(`${url}/admin/${formName}/am-i-admin`)).rejects.toThrow("401");
        await axios.get(`${url}/admin/${formName}/am-i-admin`, { headers: { "Authorization": `Bearer ${u[0].token}` } }).then(res => expect(res.data).toBe(false));
        await axios.get(`${url}/admin/${formName}/am-i-admin`, { headers: { "Authorization": `Bearer ${u[1].token}` } }).then(res => expect(res.data).toBe(false));
        await axios.get(`${url}/admin/${formName}/am-i-admin`, { headers: { "Authorization": `Bearer ${u[2].token}` } }).then(res => expect(res.data).toBe(true));

        await expect(axios.get(`${url}/admin/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[0].token}` } })).rejects.toThrow("403");
        await expect(axios.get(`${url}/admin/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[1].token}` } })).rejects.toThrow("403");
        const ids = await axios.get(`${url}/admin/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u[2].token}` } }).then(res => {
            expect(res.data.data.length).toBeGreaterThanOrEqual(3);
            //TODO: подправить вверху отправляемые данные
            expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "ccc1", id: expect.anything(), submitter: expect.anything() });
            expect(res.data.data).toContainEqual({ test: "YourDearAdmin", test2: "666", "another-column": "bites-the-row", id: expect.anything(), submitter: expect.anything() });
            expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "777", "another-column": "ъуъ", id: expect.anything(), submitter: expect.anything() });
            return res.data.data.map((x: any) => x.id);
        });

        //Просмотр конкретных
        for (const id of ids)
            await expect(axios.get(`${url}/admin/${formName}/submissions/${id}`, { headers: { "Authorization": `Bearer ${u[2].token}` } })).resolves.toBeDefined();

        //Изменение конкретных
        for (const id of ids) {
            const data = await axios.get(`${url}/${formName}/submissions/${id}`, { headers: { "Authorization": `Bearer ${u[2].token}` } }).then(res => res.data);
            await axios.put(`${url}/${formName}/submissions/${id}`, { test: data.test, test2: Number(data.test2), "another-column": "Здесь был админ" }, { headers: { "Authorization": `Bearer ${u[2].token}` } });
            await axios.get(`${url}/${formName}/submissions/${id}`, { headers: { "Authorization": `Bearer ${u[2].token}` } }).then(res => {
                expect(res.data).toEqual({ ...data, "another-column": "Здесь был админ", submitter: expect.anything() });
            });
        }

        //Удаление конкретных
        for (const id of ids) {
            await expect(axios.delete(`${url}/${formName}/submissions/${id}`, { headers: { "Authorization": `Bearer ${u[2].token}` } })).resolves.toBeDefined();
            await expect(axios.get(`${url}/${formName}/submissions/${id}`, { headers: { "Authorization": `Bearer ${u[2].token}` } })).rejects.toThrow("404");
        }

        //Добавление через специальный путь в админке
        await axios.post(`${url}/admin/${formName}/submissions`, { test: "Адмиииииииииииииииииин", test2: 2424, "another-column": "Админ и только админ" }, { headers: { "Authorization": `Bearer ${u[2].token}` } });

        //////////////////
        //Методы для API//
        //////////////////

        await expect(axios.get(`${url}/admin/${formName}/api`)).rejects.toThrow("401");
        await expect(axios.post(`${url}/admin/${formName}/api`)).rejects.toThrow("401");
        await expect(axios.post(`${url}/admin/${formName}/api`, {}, { headers: { "Authorization": `Bearer ${u[0].token}` } })).rejects.toThrow("403");
        await expect(axios.post(`${url}/admin/${formName}/api`, {}, { headers: { "Authorization": `Bearer ${u[1].token}` } })).rejects.toThrow("403");
        await expect(axios.get(`${url}/admin/${formName}/api`, { headers: { "Authorization": `Bearer ${u[0].token}` } })).rejects.toThrow("403");
        await expect(axios.get(`${url}/admin/${formName}/api`, { headers: { "Authorization": `Bearer ${u[1].token}` } })).rejects.toThrow("403");
        await axios.get(`${url}/admin/${formName}/api`, { headers: { "Authorization": `Bearer ${u[2].token}` } }).then(res => {
            expect(res.data).toBeDefined();
        });
        const serviceKey = await axios.post(`${url}/admin/${formName}/api`, {}, { headers: { "Authorization": `Bearer ${u[2].token}` } }).then(res => res.data.authKey);
        expect(serviceKey).toBeDefined();
        const randomServiceKey = random();
        //Просмотр всех

        await expect(axios.get(`${url}/api/${formName}/submissions`)).rejects.toThrow("401");
        await expect(axios.get(`${url}/api/${formName}/submissions`, { headers: { "Auth-Key": randomServiceKey } })).rejects.toThrow("401");
        await axios.get(`${url}/api/${formName}/submissions`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data.data).toHaveLength(1);
            expect(res.data.data).toContainEqual({ test: "Адмиииииииииииииииииин", test2: "2424", "another-column": "Админ и только админ", id: expect.anything(), submitter: expect.anything() });
        });

        await expect(axios.post(`${url}/${formName}/submissions`, { "test": random(), "test2": 413, "another-column": "bites-the-row" },
            { headers: { "Authorization": `Bearer ${u[0].token}` } })).resolves.toBeDefined();

        await expect(axios.get(`${url}/api/${formName}/submissions`)).rejects.toThrow("401");
        await expect(axios.get(`${url}/api/${formName}/submissions`, { headers: { "Auth-Key": randomServiceKey } })).rejects.toThrow("401");
        let apiIdForEdit = "";
        const apiIds = await axios.get(`${url}/api/${formName}/submissions`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data.data).toHaveLength(2);
            expect(res.data.data).toContainEqual({ test: "Адмиииииииииииииииииин", test2: "2424", "another-column": "Админ и только админ", id: expect.anything(), submitter: expect.anything() });
            expect(res.data.data).toContainEqual({ test: expect.anything(), test2: "413", "another-column": "bites-the-row", id: expect.anything(), submitter: expect.anything() });
            apiIdForEdit = res.data.data.filter((x: any) => x.test2 === "413").map((x: any) => x.id)[0];
            return res.data.data.map((x: any) => x.id);
        });

        //Просмотр конкретного
        for (const id of apiIds) {
            await expect(axios.get(`${url}/api/${formName}/submissions/${id}`)).rejects.toThrow("401");
            await expect(axios.get(`${url}/api/${formName}/submissions/${id}`, { headers: { "Auth-Key": randomServiceKey } })).rejects.toThrow("401");
            await axios.get(`${url}/api/${formName}/submissions/${id}`, { headers: { "Auth-Key": serviceKey } }).then(res => {
                if (res.data.test2 === "413")
                    expect(res.data).toEqual({ test: expect.anything(), test2: "413", "another-column": "bites-the-row", id: id, submitter: expect.anything() });
                else
                    expect(res.data).toEqual({ test: "Адмиииииииииииииииииин", test2: "2424", "another-column": "Админ и только админ", id: id, submitter: expect.anything() });
            });
        }

        //Изменение конкретного
        await expect(axios.put(`${url}/api/${formName}/submissions/${apiIdForEdit}`)).rejects.toThrow("401");
        await expect(axios.put(`${url}/api/${formName}/submissions/${apiIdForEdit}`, { headers: { "Auth-Key": randomServiceKey } })).rejects.toThrow("401");
        await axios.put(`${url}/api/${formName}/submissions/${apiIdForEdit}`, { test: "api", test2: 42, "another-column": "not a robot" }, { headers: { "Auth-Key": serviceKey } });
        await axios.get(`${url}/api/${formName}/submissions/${apiIdForEdit}`, { headers: { "Auth-Key": serviceKey } }).then(res => expect(res.data).toEqual({ test: "api", test2: "42", "another-column": "not a robot", id: apiIdForEdit, submitter: expect.anything() }));

        //Добавление с возможностью присвоения идентификатора отправителя
        //Конкретно тут отправителя нет, так как он не указан в описывающем файле
        await expect(axios.post(`${url}/api/${formName}/submissions`)).rejects.toThrow("401");
        await expect(axios.post(`${url}/api/${formName}/submissions`, { headers: { "Auth-Key": randomServiceKey } })).rejects.toThrow("401");
        await axios.post(`${url}/api/${formName}/submissions`, { test: "Sonic's the name", test2: 1998, "another-column": "Speed's my game" }, { headers: { "Auth-Key": serviceKey } });
        await axios.get(`${url}/api/${formName}/submissions`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data.data).toHaveLength(3);
            expect(res.data.data).toContainEqual({ test: "Адмиииииииииииииииииин", test2: "2424", "another-column": "Админ и только админ", id: expect.anything(), submitter: expect.anything() });
            expect(res.data.data).toContainEqual({ test: "api", test2: "42", "another-column": "not a robot", id: apiIdForEdit, submitter: expect.anything() });
            expect(res.data.data).toContainEqual({ test: "Sonic's the name", test2: "1998", "another-column": "Speed's my game", id: expect.anything(), submitter: null });
        });

        //Удаление конкретного
        await expect(axios.delete(`${url}/api/${formName}/submissions/${apiIdForEdit}`)).rejects.toThrow("401");
        await expect(axios.delete(`${url}/api/${formName}/submissions/${apiIdForEdit}`, { headers: { "Auth-Key": randomServiceKey } })).rejects.toThrow("401");
        await expect(axios.delete(`${url}/api/${formName}/submissions/${apiIdForEdit}`, { headers: { "Auth-Key": serviceKey } })).resolves.toBeDefined();
        await expect(axios.get(`${url}/api/${formName}/submissions/${apiIdForEdit}`, { headers: { "Auth-Key": serviceKey } })).rejects.toThrow("404");
        await axios.get(`${url}/api/${formName}/submissions`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data.data).toHaveLength(2);
            expect(res.data.data).toContainEqual({ test: "Адмиииииииииииииииииин", test2: "2424", "another-column": "Админ и только админ", id: expect.anything(), submitter: expect.anything() });
            expect(res.data.data).toContainEqual({ test: "Sonic's the name", test2: "1998", "another-column": "Speed's my game", id: expect.anything(), submitter: null });
        });
    });
});
