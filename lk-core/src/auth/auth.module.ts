import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../entity/Service';
import APIService from '../services/api.service';
import { AuthKeyStrategy } from './AuthKeyStrategy';
import { JwtStrategy } from './JwtStrategy';
import { NoJwtStrategy } from './NoJwtStrategy';
import DescriptionFile from 'src/entity/DescriptionFile';
import { LKRoleService } from "src/auth/lk-role.service";
import { CacheService } from './CacheService';

const getAuthModuleMetadata = (useJwtStrategy = true) => {
    return {
        imports: [PassportModule, TypeOrmModule.forFeature([Service, DescriptionFile])],
        providers: [useJwtStrategy ? JwtStrategy : NoJwtStrategy, AuthKeyStrategy, APIService, LKRoleService, CacheService],
        exports: [LKRoleService]
    };
};

@Module({})
export class AuthModule {
    static register(useJwtStrategy = true): DynamicModule {
        return {
            module: AuthModule,
            ...getAuthModuleMetadata(useJwtStrategy)
        };
    }
}
