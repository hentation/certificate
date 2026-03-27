import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Shortener from "src/entity/Shortener";

@Injectable()
export default class ShortenerService {
    constructor(
        @InjectRepository(Shortener) private readonly repo: Repository<Shortener>,
    ) { }

    async getOne(shortId: string): Promise<Shortener> {
        const result = await this.repo.findOneBy({short: shortId});
        return result ?? {short: shortId, target: shortId};
    }

    async getOneByFormName(formName: string): Promise<Shortener | null> {
        return this.repo.findOneBy({target: formName});
    }

    async update(formName: string, short: string) {
        if (!short) throw new BadRequestException("Сокращённое наименовае формы не может быть пустым");
        return this.repo.upsert({short, target: formName}, ["target"]);
    }

    async delete(formName: string) {
        return this.repo.delete({target: formName});
    }
}