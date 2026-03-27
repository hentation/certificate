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
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import AdminService from '../src/services/admin.service';
import { sortForTest } from './sortForTests.spec';

type user = {
  name: string,
  token: string
}

const submitters = Array(3).fill(0).map(() => faker.internet.userName());

const getRandomResponse = () => {
    return {
        submitter: faker.helpers.arrayElement(submitters),
        title: [faker.location.street(), faker.word.sample(), faker.music.genre()].join(" "),
        needsEventEscort: Math.random() > 0.5,
        contactPhone: faker.phone.number(),
        contactEmail: faker.internet.email(),
    };
};

const submissions = Array(100).fill(0).map(() => getRandomResponse());

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
            },
            {
                name: "needsEventEscort",
                type: "bool",
            },
            {
                name: "contactPhone",
                type: "string",
            },
            {
                name: "contactEmail",
                type: "string",
            },
        ]
    },
};

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
            databaseName: "queryTest"
        })).compile();
        app = module.createNestApplication();
        await app.init();
        url = request(app.getHttpServer()).get("").url;

        serviceService = module.get(APIService);
        adminService = module.get(AdminService);

        users = submitters.map(x => {
            return {
                name: x,
                token: jwt.sign({ user: { person: { id: x } } }, secretForTests)
            };
        });

        // @ts-expect-error: private
        adminService.roles.set(users[0].name, [{user: users[0].name, service: "lk-contacts-admin", role: "admin", context: null}]);

        const resp: DataSource = module.get(getDataSourceToken());
        await resp.createQueryBuilder().from("Responses", "r").delete().execute();

        serviceKey = await axios.post(`${url}/admin/${formName}/api`, undefined, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => res.data.authKey);

        await Promise.all(
            submissions.map(async x => await axios.post(`${url}/api/${formName}/submissions`, x, { headers: { "Auth-Key": serviceKey } })),
        );

        await axios.get(`${url}/api/${formName}/submissions`, { headers: { "Auth-Key": serviceKey } });
    }, 100_100);

    it("API", async () => {
        await axios.get(`${url}/api/${formName}/submissions`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(submissions.length);
        });
        await axios.get(`${url}/api/${formName}/submissions?take=10`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(10);
        });
        await axios.get(`${url}/api/${formName}/submissions?take=20`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(20);
        });
        await axios.get(`${url}/api/${formName}/submissions?take=40`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(40);
        });

        await axios.get(`${url}/api/${formName}/submissions?skip=10`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(90);
        });
        await axios.get(`${url}/api/${formName}/submissions?skip=20`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(80);
        });

        let prevData: ReturnType<typeof getRandomResponse>[];
        await axios.get(`${url}/api/${formName}/submissions?take=10`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(10);
            prevData = res.data.data;
        });
        await axios.get(`${url}/api/${formName}/submissions?take=10&skip=10`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(10);
            for (const o of res.data.data)
                expect(prevData).not.toContainEqual(o);
        });

        const keys = (df.fields?.formFields?.map(x => x.name) ?? []) as (keyof typeof submissions[0])[];
        expect(keys).toEqual(["title", "needsEventEscort", "contactPhone", "contactEmail"]);

        for (const k of keys) {
            const sortedValues = submissions.map(x => x[k].toString().toLowerCase());
            sortedValues.sort(sortForTest);
            await axios.get(`${url}/api/${formName}/submissions?order=${k}`, { headers: { "Auth-Key": serviceKey } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(submissions.length);
                expect(res.data.data).toHaveLength(submissions.length);
                expect(res.data.data.map((x: any) => x[k].toString().toLowerCase?.() ?? x[k])).toEqual(sortedValues);
            });

            await axios.get(`${url}/api/${formName}/submissions?order=${k}&asc=true`, { headers: { "Auth-Key": serviceKey } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(submissions.length);
                expect(res.data.data).toHaveLength(submissions.length);
                expect(res.data.data.map((x: any) => x[k].toString().toLocaleLowerCase?.() ?? x[k])).toEqual(sortedValues);
            });

            sortedValues.reverse();
            await axios.get(`${url}/api/${formName}/submissions?order=${k}&asc=false`, { headers: { "Auth-Key": serviceKey } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(submissions.length);
                expect(res.data.data).toHaveLength(submissions.length);
                expect(res.data.data.map((x: any) => x[k].toString().toLocaleLowerCase?.() ?? x[k])).toEqual(sortedValues);
            });
        }

        await axios.get(`${url}/api/${formName}/submissions?search=${JSON.stringify({ title: "ая" })}`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            const r = res.data.data.map((x: any) => x.title);
            const filtered = submissions.filter(x => x.title.toLocaleLowerCase().includes("ая")).map(x => x.title);
            r.sort(sortForTest);
            filtered.sort(sortForTest);
            expect(r).toEqual(filtered);
        });

        await axios.get(`${url}/api/${formName}/submissions?search=${JSON.stringify({ title: "АЯ" })}`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            const r = res.data.data.map((x: any) => x.title);
            const filtered = submissions.filter(x => x.title.toLocaleLowerCase().includes("ая")).map(x => x.title);
            r.sort(sortForTest);
            filtered.sort(sortForTest);
            expect(r).toEqual(filtered);
        });

        await axios.get(`${url}/api/${formName}/submissions?search=${JSON.stringify({ title: "е", submitter: submitters[1] })}`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            const filtered = submissions.filter(x => x.title.toLocaleLowerCase().includes("е") && x.submitter === submitters[1]).map(x => x.title);
            const r = res.data.data.map((x: any) => x.title);
            r.sort(sortForTest);
            filtered.sort(sortForTest);
            expect(r).toEqual(filtered);
        });

        await axios.get(`${url}/api/${formName}/submissions?search=${JSON.stringify({ title: "е", submitter: submitters[1], contactPhone: "13" })}`, { headers: { "Auth-Key": serviceKey } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            const filtered = submissions.filter(x => x.title.toLocaleLowerCase().includes("е") && x.submitter === submitters[1] && x.contactPhone.includes("13")).map(x => x.title);
            const r = res.data.data.map((x: any) => x.title);
            r.sort(sortForTest);
            filtered.sort(sortForTest);
            expect(r).toEqual(filtered);
        });
    });

    it("Админ", async () => {
        await axios.get(`${url}/admin/${formName}/submissions`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(submissions.length);
        });
        await axios.get(`${url}/admin/${formName}/submissions?take=10`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(10);
        });
        await axios.get(`${url}/admin/${formName}/submissions?take=20`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(20);
        });
        await axios.get(`${url}/admin/${formName}/submissions?take=40`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(40);
        });

        await axios.get(`${url}/admin/${formName}/submissions?skip=10`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(90);
        });
        await axios.get(`${url}/admin/${formName}/submissions?skip=20`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(80);
        });

        let prevData: ReturnType<typeof getRandomResponse>[];
        await axios.get(`${url}/admin/${formName}/submissions?take=10`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(10);
            prevData = res.data.data;
        });
        await axios.get(`${url}/admin/${formName}/submissions?take=10&skip=10`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            expect(res.data.count).toEqual(submissions.length);
            expect(res.data.data).toHaveLength(10);
            for (const o of res.data.data)
                expect(prevData).not.toContainEqual(o);
        });

        const keys = (df.fields?.formFields?.map(x => x.name) ?? []) as (keyof typeof submissions[0])[];
        expect(keys).toEqual(["title", "needsEventEscort", "contactPhone", "contactEmail"]);
        for (const k of keys) {

            const sortedValues = submissions.map(x => x[k].toString().toLowerCase());
            sortedValues.sort(sortForTest);
            await axios.get(`${url}/admin/${formName}/submissions?order=${k}`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(submissions.length);
                expect(res.data.data).toHaveLength(submissions.length);
                expect(res.data.data.map((x: any) => x[k].toString().toLowerCase?.() ?? x[k])).toEqual(sortedValues);
            });

            await axios.get(`${url}/admin/${formName}/submissions?order=${k}&asc=true`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(submissions.length);
                expect(res.data.data).toHaveLength(submissions.length);
                expect(res.data.data.map((x: any) => x[k].toString().toLowerCase?.() ?? x[k])).toEqual(sortedValues);
            });

            sortedValues.reverse();
            await axios.get(`${url}/admin/${formName}/submissions?order=${k}&asc=false`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(submissions.length);
                expect(res.data.data).toHaveLength(submissions.length);
                expect(res.data.data.map((x: any) => x[k].toString().toLowerCase?.() ?? x[k])).toEqual(sortedValues);
            });
        }

        await axios.get(`${url}/admin/${formName}/submissions?search=${JSON.stringify({ title: "ая" })}`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            const r = res.data.data.map((x: any) => x.title);
            const filtered = submissions.filter(x => x.title.toLocaleLowerCase().includes("ая")).map(x => x.title);
            r.sort(sortForTest);
            filtered.sort(sortForTest);
            expect(r).toEqual(filtered);
        });

        await axios.get(`${url}/admin/${formName}/submissions?search=${JSON.stringify({ title: "АЯ" })}`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            const r = res.data.data.map((x: any) => x.title);
            const filtered = submissions.filter(x => x.title.toLocaleLowerCase().includes("ая")).map(x => x.title);
            r.sort(sortForTest);
            filtered.sort(sortForTest);
            expect(r).toEqual(filtered);
        });

        await axios.get(`${url}/admin/${formName}/submissions?search=${JSON.stringify({ title: "е", submitter: submitters[1] })}`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            const r = res.data.data.map((x: any) => x.title);
            const filtered = submissions.filter(x => x.title.toLocaleLowerCase().includes("е") && x.submitter === submitters[1]).map(x => x.title);
            r.sort(sortForTest);
            filtered.sort(sortForTest);
            expect(r).toEqual(filtered);
        });

        await axios.get(`${url}/admin/${formName}/submissions?search=${JSON.stringify({ title: "е", submitter: submitters[1], contactPhone: "13" })}`, { headers: { "Authorization": `Bearer ${users[0].token}` } }).then(res => {
            expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
            const r = res.data.data.map((x: any) => x.title);
            const filtered = submissions.filter(x => x.title.toLocaleLowerCase().includes("е") && x.submitter === submitters[1] && x.contactPhone.includes("13")).map(x => x.title);
            r.sort(sortForTest);
            filtered.sort(sortForTest);
            expect(r).toEqual(filtered);
        });
    });

    it("Пользователи", async () => {
        for (const u of users.slice(1)) {
            const userSubmissions = submissions.filter(x => x.submitter === u.name);
            await axios.get(`${url}/${formName}/submissions`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(userSubmissions.length);
                expect(res.data.data).toHaveLength(userSubmissions.length);
            });
            await axios.get(`${url}/${formName}/submissions?take=10`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(userSubmissions.length);
                expect(res.data.data).toHaveLength(Math.min(10, userSubmissions.length));
            });
            await axios.get(`${url}/${formName}/submissions?take=20`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(userSubmissions.length);
                expect(res.data.data).toHaveLength(Math.min(20, userSubmissions.length));
            });
            await axios.get(`${url}/${formName}/submissions?take=40`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(userSubmissions.length);
                expect(res.data.data).toHaveLength(Math.min(40, userSubmissions.length));
            });

            await axios.get(`${url}/${formName}/submissions?skip=10`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(userSubmissions.length);
                expect(res.data.data).toHaveLength(Math.min(90, Math.max(userSubmissions.length - 10, 0)));
            });
            await axios.get(`${url}/${formName}/submissions?skip=20`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(userSubmissions.length);
                expect(res.data.data).toHaveLength(Math.min(80, Math.max(userSubmissions.length - 20, 0)));
            });

            let prevData: ReturnType<typeof getRandomResponse>[];
            await axios.get(`${url}/${formName}/submissions?take=10`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(userSubmissions.length);
                expect(res.data.data).toHaveLength(Math.min(10, userSubmissions.length));
                prevData = res.data.data;
            });
            await axios.get(`${url}/${formName}/submissions?take=10&skip=10`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                expect(res.data.count).toEqual(userSubmissions.length);
                expect(res.data.data).toHaveLength(Math.min(10, Math.max(userSubmissions.length - 10, 0)));
                for (const o of res.data.data)
                    expect(prevData).not.toContainEqual(o);
            });

            const keys = (df.fields?.formFields?.map(x => x.name) ?? []) as (keyof typeof submissions[0])[];
            expect(keys).toEqual(["title", "needsEventEscort", "contactPhone", "contactEmail"]);
            for (const k of keys) {

                const sortedValues = userSubmissions.map(x => x[k].toString().toLowerCase());
                sortedValues.sort(sortForTest);
                await axios.get(`${url}/${formName}/submissions?order=${k}`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                    expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                    expect(res.data.count).toEqual(userSubmissions.length);
                    expect(res.data.data).toHaveLength(userSubmissions.length);
                    expect(res.data.data.map((x: any) => x[k].toString().toLowerCase?.() ?? x[k])).toEqual(sortedValues);
                });

                await axios.get(`${url}/${formName}/submissions?order=${k}&asc=true`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                    expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                    expect(res.data.count).toEqual(userSubmissions.length);
                    expect(res.data.data).toHaveLength(userSubmissions.length);
                    expect(res.data.data.map((x: any) => x[k].toString().toLowerCase?.() ?? x[k])).toEqual(sortedValues);
                });

                sortedValues.reverse();
                await axios.get(`${url}/${formName}/submissions?order=${k}&asc=false`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                    expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                    expect(res.data.count).toEqual(userSubmissions.length);
                    expect(res.data.data).toHaveLength(userSubmissions.length);
                    expect(res.data.data.map((x: any) => x[k].toString().toLowerCase?.() ?? x[k])).toEqual(sortedValues);
                });
            }

            await axios.get(`${url}/${formName}/submissions?search=${JSON.stringify({ title: "ая" })}`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                const r = res.data.data.map((x: any) => x.title);
                const filtered = userSubmissions.filter(x => x.title.toLocaleLowerCase().includes("ая")).map(x => x.title);
                r.sort(sortForTest);
                filtered.sort(sortForTest);
                expect(r).toEqual(filtered);
            });

            await axios.get(`${url}/${formName}/submissions?search=${JSON.stringify({ title: "АЯ" })}`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                const r = res.data.data.map((x: any) => x.title);
                const filtered = userSubmissions.filter(x => x.title.toLocaleLowerCase().includes("ая")).map(x => x.title);
                r.sort(sortForTest);
                filtered.sort(sortForTest);
                expect(r).toEqual(filtered);
            });

            await axios.get(`${url}/${formName}/submissions?search=${JSON.stringify({ title: "е", submitter: submitters[1] })}`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                const r = res.data.data.map((x: any) => x.title);
                const filtered = userSubmissions.filter(x => x.title.toLocaleLowerCase().includes("е") && x.submitter === submitters[1]).map(x => x.title);
                r.sort(sortForTest);
                filtered.sort(sortForTest);
                expect(r).toEqual(filtered);
            });

            await axios.get(`${url}/${formName}/submissions?search=${JSON.stringify({ title: "е", submitter: submitters[1], contactPhone: "13" })}`, { headers: { "Authorization": `Bearer ${u.token}` } }).then(res => {
                expect(res.data).toMatchObject({ data: expect.anything(), count: expect.any(Number) });
                const r = res.data.data.map((x: any) => x.title);
                const filtered = userSubmissions.filter(x => x.title.toLocaleLowerCase().includes("е") && x.submitter === submitters[1] && x.contactPhone.includes("13")).map(x => x.title);
                r.sort(sortForTest);
                filtered.sort(sortForTest);
                expect(r).toEqual(filtered);
            });
        }
    });
});
