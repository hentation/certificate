/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get, NotFoundException} from '@nestjs/common';
import { Param } from '@nestjs/common/decorators';
import { FormService } from '../../services/form.service';
import ShortenerService from 'src/services/shortener';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/public';

@ApiTags("Настройка форм")
@Controller("public")
export class PublicFormController {
    constructor(
        private readonly form: FormService,
        private readonly shortener: ShortenerService,
    ) {}

    @Public()
    @Get("forms/short/:short")
    getShort(
        @Param('short') short: string,
    ) {
        return this.shortener.getOne(short);
    }

    @Public()
    @Get("forms/:formName/is-public")
    async getIsPublic(
        @Param('formName') formName: string,
    ) {
        return this.form.isFormPublic(formName);
    }

    @Public()
    @Get("forms/:formName/config")
    async getFormConfig(
        @Param('formName') formName: string,
    ) {
        if (!this.form.isFormPublic(formName)) throw new NotFoundException("Форма не найдена");
        const result = this.form.getFormConfig(formName);
        if (!result) throw new NotFoundException();
        return result;
    }
}
