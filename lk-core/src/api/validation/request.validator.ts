import { isEmpty } from "class-validator";
import { Fields } from "../../format/description-format";
import TypeHandler from "../../format/TypeHandler";
import { BadRequestException } from "@nestjs/common";
import { ResponseClean, ResponseRaw } from "src/entity/Response";
import { safeParseJSON } from "src/format/helpers/safeParseJson";

export default function validateRequest(
    data: ResponseRaw,
    fields: Fields | undefined,
): asserts data is ResponseClean {
    if (isEmpty(data)) throw new BadRequestException("Data is empty");
    const validationResult = {} as Record<string, { message: string, value?: unknown }>;

    fields?.formFields?.forEach(x => {
        if (x.required && !Object.prototype.hasOwnProperty.call(data, x.name)) {
            validationResult[x.name] = {
                message: "Обязательное поле",
            };
        }

        const handler = TypeHandler[x.type as keyof typeof TypeHandler];
        let value = data[x.name];
        if (x.type === "file" && typeof value === "string") {
            const parseResult = safeParseJSON<unknown>(value);
            value = parseResult.success ? parseResult.value : "";
        }

        if (Object.prototype.hasOwnProperty.call(data, x.name) && !handler.validator(value)) {
            if (x.required) {
                validationResult[x.name] = {
                    message: handler.failMessage,
                    value: value,
                };
            } else {
                data[x.name] = undefined;
            }
        }
    });

    if (Object.keys(validationResult).length)
        throw new BadRequestException(validationResult);
}

export const clearRequest = (data: ResponseClean,
    fields: Fields | undefined,
    options: {isModerator: boolean, isApi: boolean, toCreate: boolean
}) => {
    if (fields?.specialFields?.includes("status") && !options.isModerator && !options.isApi)
        delete data["status"];
    if (fields?.specialFields?.includes("moderatorFeedbackToSubmission") && !options.isModerator && !options.isApi) 
        delete data["moderatorFeedback"];
    if (fields?.specialFields?.includes("formSubmissionUser") && options.toCreate && !options.isApi)
        delete data["submitter"];
    if (fields?.specialFields?.includes("formSubmissionDateTime"))
        delete data["timestamp"];

    if (!options.toCreate)
        for (const field of fields?.formFields ?? [])
            if (field.editable === false)
                delete data[field.name];
};