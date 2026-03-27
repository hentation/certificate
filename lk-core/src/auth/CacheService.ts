
import *  as NodeCache from 'node-cache';

export class CacheService {

    private cache: NodeCache;

    constructor(ttlSeconds = 300) {
        //Stryker disable next-line all: Нет смысла тестировать время жизни кеша
        this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2 });
    }

    async get<T>(key: NodeCache.Key, storeFunction: () => Promise<T>) {
        const value = this.cache.get<T>(key);
        if (value) {
            return Promise.resolve(value);
        }

        return storeFunction().then((result) => {
            this.cache.set(key, result);
            return result;
        });
    }

    del(keys: Parameters<NodeCache["del"]>[0]) {
        this.cache.del(keys);
    }

    flush() {
        this.cache.flushAll();
    }
}