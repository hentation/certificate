/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FormatService } from '../../format/FormatService';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("Информация о формах")
@Controller("info")
export class EndUserController {
    constructor(private readonly format: FormatService
    ) {}

  @ApiBearerAuth("Токен Keycloak")
  @Get("/:formName/form-template")
    async getFormTemplateForSubmission(@Param('formName') formName: string) {
        return this.format.getFieldsForSubmission(formName);
    }

  @ApiBearerAuth("Токен Keycloak")
  @Get("/:formName/view-form-template")
  async getFormTemplateForView(@Param('formName') formName: string) {
      return this.format.getFieldsForView(formName);
  }

  @ApiBearerAuth("Токен Keycloak")
  @Get("/:formName/app")
  async getAppInfo(@Param('formName') formName: string) {
      const result = this.format.getAppInfo(formName);
      if (!result) throw new NotFoundException();
      return result;
  }
}
