import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm/repository/Repository";
import { Service } from "../entity/Service";
import { isUUID } from "class-validator";

@Injectable()
export default class APIService {
    constructor(
        //TODO: переписать под репозиторий
        @InjectRepository(Service) private readonly repo: Repository<Service>
    ) { }

    async getAll(): Promise<Service[]> {
        return this.repo.find();
    }

    async findByAuthKey(authKey: string): Promise<Service | null> {
        if(!isUUID(authKey)) 
            throw new UnauthorizedException("Provided auth-key is not of type UUID");
            
        const result = await this.repo.findOneBy({authKey});
        return result;
    }

    async addService(params: {authKey: string, comment?: string}) {
        if(!isUUID(params.authKey)) 
            throw new UnauthorizedException("Provided auth-key is not of type UUID");
        return this.repo.insert({
            comment: params.comment,
            authKey: params.authKey
        });
    }

    async deleteService(authKey: string) {
        if(!isUUID(authKey)) 
            throw new UnauthorizedException("Provided auth-key is not of type UUID");
        return this.repo.createQueryBuilder().delete().where({authKey}).execute();
    }
}