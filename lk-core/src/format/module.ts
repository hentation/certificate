import { DynamicModule, Module, Provider } from "@nestjs/common";
import { TypeOrmModule, getDataSourceToken, getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DescriptionFormat } from "./description-format";
import { FormatService } from "./FormatService";
import DescriptionFile from "src/entity/DescriptionFile";
import { Repository } from "typeorm/repository/Repository";
import { Service } from "src/entity/Service";

const getService = (df?: {df: DescriptionFormat, fileName: string}): Provider => {
    return {
        provide: FormatService,
        inject: [getDataSourceToken(), getRepositoryToken(DescriptionFile)],
        useFactory: async (ds: DataSource, dfr: Repository<DescriptionFile>) => {
            const service = new FormatService(ds, dfr);
            await service.Init(df);
            return service;
        }
    };
};

@Module({})
export class FormatModule {
    static register(descriptionFormat?: {df: DescriptionFormat, fileName: string}): DynamicModule {
        const service = getService(descriptionFormat);
        return {
            module: FormatModule,
            exports: [service],
            providers: [service],
            imports: [TypeOrmModule.forFeature([Service, DescriptionFile])]
        };
    }
}
