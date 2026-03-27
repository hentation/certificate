import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import secretForTests from "../secretForTests";
import { JwtStrategy } from "./JwtStrategy";

@Injectable()
export class NoJwtStrategy extends PassportStrategy(Strategy, 'jwt') { 
    constructor() { 
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secretForTests
        });
    }

    async validate(jwtPayload: any) {
        return JwtStrategy.getUserName(jwtPayload);
    }
}