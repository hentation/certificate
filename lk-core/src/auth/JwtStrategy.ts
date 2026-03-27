import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import axios from 'axios';
import { CacheService } from "./CacheService";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

    //Stryker disable next-line all: Нет смысла тестировать время жизни кеша
    private cache: CacheService = new CacheService(60 * 60);

    static getUserName(jwtPayload: any): string | undefined {
        return jwtPayload?.user?.person?.id;
    }

    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKeyProvider: async function (req: any, token: any, done: any) {
                const key = await this.cache.get('keycloakPublicKey',
                    async () => await this.getKeycloakPublicKey());
                return done(null, key);
            },
            algorithms: ['RS256']
        });
    }

    async getKeycloakPublicKey() {
        const res = await axios.get(`${process.env.KK_URL}/realms/${process.env.KK_REALM}`);
        return `-----BEGIN PUBLIC KEY-----\n${res.data.public_key}\n-----END PUBLIC KEY-----`;
    }

    async validate(jwtPayload: any) {
        return JwtStrategy.getUserName(jwtPayload);
    }
}