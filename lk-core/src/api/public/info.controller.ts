/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FormatService } from '../../format/FormatService';
import { ApiTags } from '@nestjs/swagger';
import { FormService } from 'src/services/form.service';
import { Public } from 'src/auth/public';

@ApiTags("Информация о формах")
@Controller("public/info")
export class PublicEndUserController {
    constructor(
      private readonly format: FormatService,
      
      private readonly form: FormService,
    ) {}

    @Public()
  @Get("/:formName/form-template")
    async getFormTemplateForSubmission(@Param('formName') formName: string) {
        if (!this.form.isFormPublic(formName)) throw new NotFoundException("Форма не найдена");
        return this.format.getFieldsForSubmission(formName);
    }

    @Public()
  @Get("/:formName/view-form-template")
    async getFormTemplateForView(@Param('formName') formName: string) {
        if (!this.form.isFormPublic(formName)) throw new NotFoundException("Форма не найдена");
        return this.format.getFieldsForView(formName);
    }

  @Public()
  @Get("/:formName/app")
    async getAppInfo(@Param('formName') formName: string) {
        if (!this.form.isFormPublic(formName)) throw new NotFoundException("Форма не найдена");
        const result = this.format.getAppInfo(formName);
        if (!result) throw new NotFoundException();
        return result;
    }
}
