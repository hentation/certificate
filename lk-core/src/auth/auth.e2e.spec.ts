import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { moduleMetadata } from '../app.module';
import bootstrap from '../main';
import * as jwt from "jsonwebtoken";
import { faker } from '@faker-js/faker';
import secretForTests from '../secretForTests';
import axios from 'axios';
const random = () => faker.string.alphanumeric(16);

const someProtectedPath = "/forms";

describe('AppController (e2e)', () => {
    describe("JWT Protected app", () => {
        let app: INestApplication;

        afterAll(async() => await app.close());
        beforeAll(async () => {
            app = await bootstrap(undefined);
        });

        it('should ask authorization for protected path', () => {
            return request(app.getHttpServer())
                .get(someProtectedPath)
                .expect(401);
        });
  
        it('should not accept random string as valid token', () => {
            return request(app.getHttpServer())
                .get(someProtectedPath)
                .auth(random(), {type: "bearer"})
                .expect(401);
        });
    });

    describe("Unprotected app", () => {
        let app: INestApplication;
        afterAll(async() => await app.close());
        beforeAll(async () => {
            app = (await Test.createTestingModule(moduleMetadata({useJWT: false})).compile()).createNestApplication();
            await app.init();
        });

        it('protected path now shouldnt be protected', () => {
            return request(app.getHttpServer())
                .get(someProtectedPath)
                .expect(200);
        });
    });

    describe("Protected app with test key", () => {
        let app: INestApplication;
        let url: string;
        afterAll(async() => await app.close());
        beforeAll(async () => {
            const module = await Test.createTestingModule(moduleMetadata({useJWT: true, useJwtStrategy: false})).compile();
            app = module.createNestApplication();
            await app.init();
            url = request(app.getHttpServer()).get("").url;
        });

        it('protected path now should be protected', () => {
            return request(app.getHttpServer())
                .get(someProtectedPath)
                .expect(401);
        });

        it('protected path now should accept the test key', async () => {
            const token = jwt.sign({ user: {person: {id: random()}} }, secretForTests);

            await axios.get(url+someProtectedPath, {headers: {"Authorization": "Bearer "+token}})
                .then(r => expect(r.status).toBe(200));
        });
    });
});
