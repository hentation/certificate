import { BadRequestException } from "@nestjs/common";

export const escapeId = (value: string): string => {
    if (!value) throw new BadRequestException(`Неверное имя [${value}]`);
    if (value.startsWith("_")) throw new BadRequestException(`Неверное имя [${value}]`);
    if (!value.match(/^[A-Za-z0-9_]+$/)) throw new BadRequestException(`Неверное имя [${value}]`);
    return value;
};