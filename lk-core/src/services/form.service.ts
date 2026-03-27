import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { FormatService } from "../format/FormatService";
import { randomUUID } from "crypto";
import { transformAndValidate } from "class-transformer-validator";
import { DescriptionFormat, DescriptionFormatDTO } from "../format/description-format";
import { compactValidationError } from "src/format/helpers/compactValidationError";
import DescriptionFile from "src/entity/DescriptionFile";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm/repository/Repository";

const descriptionFileTemplateNew = {
    app: {
        appTitle: "Новая форма",
        appDescription: ""
    },
    forms: {
        enableFormSubmissionByAnyUser: true,
    },
    fields: {
        specialFields: [
            "status",
            "formSubmissionDateTime",
            "formSubmissionUser",
            "moderatorFeedbackToSubmission",
        ],
        formFields: []
    },
};

@Injectable()
export class FormService {
    constructor(
        private readonly format: FormatService,
        @InjectRepository(DescriptionFile) private readonly descFile: Repository<DescriptionFile>,
    ) { }

    private readonly logger = new Logger(FormatService.name);

    getAvailableForms() {
        return [...this.format.format.entries()].map(x => { return { id: x[0], name: x[1].app?.appTitle }; });
    }

    getFormConfig(formName: string) {
        return this.format.format.get(formName);
    }

    doesFormExist(formName: string) {
        return this.format.format.has(formName);
    }

    isFormPublic(formName: string) {
        return Boolean(this.format.format.get(formName)?.forms?.isPublic);
    }

    async updateFormConfig(formName: string, newConfig: DescriptionFormatDTO) {
        if (!this.format.format.has(formName)) throw NotFoundException;
        const currentFormat = this.format.format.get(formName);
        const newFormat = { ...currentFormat, ...newConfig };

        await transformAndValidate(DescriptionFormat, newFormat, { validator: { whitelist: true } }).then(async o => {
            this.format.format.set(formName, o);
            await this.descFile.save({ name: formName, content: JSON.stringify(newFormat) });
            await this.format.prepareDBTable(formName);
        })
            .catch(e => {
                // Обычно этого не должно произойти
                //TODO: сделать более короткий вывод при нарушении спецификации описывающего файла
                this.logger.error(`The ${formName} provided didn't meet the format, please make sure it's a valid DescriptionFormat object.`, compactValidationError(e));
            });
    }

    async createNewForm() {
        const newFormId = randomUUID().replaceAll("-", "");
        await this.descFile.save({ name: newFormId, content: JSON.stringify(descriptionFileTemplateNew) });
        const newForm = structuredClone(descriptionFileTemplateNew) as DescriptionFormat;
        await transformAndValidate(DescriptionFormat, newForm, { validator: { whitelist: true } }).then(o => {
            this.format.format.set(newFormId, o);
        });
        await this.format.prepareDBTable(newFormId);
        return newFormId;
    }
}