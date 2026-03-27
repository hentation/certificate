import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { moduleMetadata } from '../src/app.module';
import APIService from '../src/services/api.service';
import { faker } from '@faker-js/faker';
import axios from "axios";
import * as request from 'supertest';
import * as jwt from "jsonwebtoken";
import secretForTests from '../src/secretForTests';
import { calculateDescriptionFormatHash } from '../src/calculateDFHash';
import { DescriptionFormat } from '../src/format/description-format';
import { randomUUID } from 'crypto';
const random = () => faker.string.alphanumeric(16);


type user = {
  name: string,
  token: string
}

const df: DescriptionFormat = {
    fields: {
        formFields: [
            {
                name: "test",
                type: "string"
            },
            {
                name: "test2",
                type: "number"
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

    let serviceService: APIService;

    const u: user = {name: random(), token: ""};

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
        u.token = jwt.sign({ user: {person: {id: u.name}} }, secretForTests);
    
        serviceService = module.get(APIService);
    });

    it("Сервис", async() => {
        const serviceAuthKey = randomUUID();

        await expect(serviceService.addService({authKey: serviceAuthKey})).resolves.toBeDefined();
        await serviceService.findByAuthKey(serviceAuthKey).then(res => expect(res).toMatchObject({authKey: serviceAuthKey, comment: null}));

        await expect(axios.get(`${url}/api/${formName}/submissions`)).rejects.toThrow("401");
        await expect(axios.get(`${url}/api/${formName}/submissions`, {headers: {"Auth-Key": randomUUID()}})).rejects.toThrow("401");
        await expect(axios.get(`${url}/api/${formName}/submissions`, {headers: {"Auth-Key": serviceAuthKey}})).resolves.toBeDefined();

        if (process.env.TESTS_DONT_CLEAR !== "1") {
            await serviceService.deleteService(serviceAuthKey);
        }
    });
});