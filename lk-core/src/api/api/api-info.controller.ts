/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FormatService } from '../../format/FormatService';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags("Информация о формах для API")
@Controller("api-info")
export class ApiInfoController {
    constructor(private readonly format: FormatService
    ) {}

  @UseGuards(AuthGuard("auth-key"))
  @Get("/:formName/form-template")
    async getFormTemplateForSubmission(@Param('formName') formName: string) {
        return this.format.getFieldsForSubmission(formName);
    }

  @UseGuards(AuthGuard("auth-key"))
  @Get("/:formName/view-form-template")
  async getFormTemplateForView(@Param('formName') formName: string) {
      return this.format.getFieldsForView(formName);
  }

  @UseGuards(AuthGuard("auth-key"))
  @Get("/:formName/app")
  async getAppInfo(@Param('formName') formName: string) {
      return this.format.getAppInfo(formName);
  }
}
