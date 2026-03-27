//https://github.com/typestack/class-validator
import { isArray, isBoolean, isDateString, isEmpty, isNumber, isString } from "class-validator";
import { SupportedFieldTypes } from "./const";
import {z} from "zod";

export const fileTypeValidator = z.object({
    id: z.string().nullable(),
    type: z.string(),
    name: z.string(),
    content: z.string().base64(),
});

const TypeHandler: { [k in SupportedFieldTypes]: {
    dbType: string,
    validator: (x: unknown) => boolean,
    failMessage: string,
} } = {
    string: {
        dbType: "TEXT",
        validator: isString,
        failMessage: "Не строка"
    },
    number: {
        dbType: "NUMERIC",
        validator: isNumber,
        failMessage: "Не число"
    },
    bool: {
        dbType: "BOOLEAN",
        validator: isBoolean,
        failMessage: "Не логическое значение"
    },
    list: {
        dbType: "TEXT",
        validator: isArray,
        failMessage: "Не массив"
    },
    info: {
        dbType: "TEXT",
        validator: isEmpty,
        failMessage: "Значение не должно быть передано, должно быть пустым"
    },
    separator: {
        dbType: "TEXT",
        validator: isEmpty,
        failMessage: "Значение не должно быть передано, должно быть пустым"
    },
    date: {
        dbType: "TIMESTAMPTZ",
        validator: isDateString,
        failMessage: "Формат времени не соответствует ISO8601"
    },
    file: {
        dbType: "TEXT",
        validator: (x: unknown) => fileTypeValidator.safeParse(x).success,
        failMessage: "Не файл"
    },
};

export default TypeHandler;