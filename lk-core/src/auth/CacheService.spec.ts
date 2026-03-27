import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './CacheService';

import { faker } from '@faker-js/faker';
const random = () => faker.string.alphanumeric(16);

describe('ChannelService', () => {
    let service: CacheService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CacheService]
        }).compile();
        service = module.get(CacheService);
    });

    it('should behave like this', async () => {
        const key = random();
        const key2 = random();
        const v1 = random();
        const v2 = random();
        const v3 = random();
        const v4 = random();

        await expect(service.get(key, ()=> Promise.resolve(v1))).resolves.toBe(v1);
        await expect(service.get(key, ()=> Promise.resolve(v2))).resolves.toBe(v1);
        await expect(service.get(key2, ()=> Promise.resolve(v4))).resolves.toBe(v4);
        await expect(service.get(key2, ()=> Promise.resolve(v2))).resolves.toBe(v4);
        await expect(service.get(key, ()=> Promise.resolve(v2))).resolves.toBe(v1);
        service.del(key);
        await expect(service.get(key, ()=> Promise.resolve(v2))).resolves.toBe(v2);
        await expect(service.get(key2, ()=> Promise.resolve(v2))).resolves.toBe(v4);
        service.flush();
        await expect(service.get(key, ()=> Promise.resolve(v3))).resolves.toBe(v3);
        await expect(service.get(key2, ()=> Promise.resolve(v4))).resolves.toBe(v4);
    });
});
