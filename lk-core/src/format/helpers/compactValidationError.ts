import { ValidationError } from "class-validator";

const isList = (e: ValidationError[] | ValidationError[][]): e is ValidationError[][] => {
    return (e as ValidationError[][])[0]?.[0]?.property !== undefined;
};

export const compactValidationError = (e: ValidationError[] | ValidationError[][]): any => {
    const result: {[k: string]: {[k: string]: string}} = {};
    if (isList(e))
        return e.map(x => compactValidationError(x));
    e?.forEach?.(x => {
        result[x.property] = x.children?.length ? compactValidationError(x.children) : x.constraints;
    });
    return result;
};