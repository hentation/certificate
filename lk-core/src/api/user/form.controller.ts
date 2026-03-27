/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get, Put, ForbiddenException, NotFoundException} from '@nestjs/common';
import { Body, Param, Post, Request } from '@nestjs/common/decorators';
import { FormService } from '../../services/form.service';
import { DescriptionFormatDTO } from '../../format/description-format';
import ShortenerService from 'src/services/shortener';
import AdminService from 'src/services/admin.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("Настройка форм")
@Controller()
export class FormController {
    constructor(
        private readonly form: FormService,
        private readonly shortener: ShortenerService,
        private readonly adminService: AdminService,
    ) {}

    @ApiBearerAuth("Токен Keycloak")
    @Get("forms")
    async getAvailableForms(
        @Request() req: { user: string },
    ) {
        const isAdmin = await this.adminService.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        return this.form.getAvailableForms();
    }

    @ApiBearerAuth("Токен Keycloak")
    @Get("forms/short/:short")
    getShort(
        @Param('short') short: string,
    ) {
        return this.shortener.getOne(short);
    }

    @ApiBearerAuth("Токен Keycloak")
    @Get("forms/:formName/config")
    async getFormConfig(
        @Param('formName') formName: string,
    ) {
        const result = this.form.getFormConfig(formName);
        if (!result) throw new NotFoundException();
        return result;
    }

    @ApiBearerAuth("Токен Keycloak")
    @Post("forms")
    async createNewForm(@Request() req: { user: string },) {
        const isAdmin = await this.adminService.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        return this.form.createNewForm();
    }

    @ApiBearerAuth("Токен Keycloak")
    @Put("forms/:formName/config")
    async updateForm(
        @Param('formName') formName: string,
        @Body() data: DescriptionFormatDTO,
        @Request() req: { user: string },
    ) {
        const isAdmin = await this.adminService.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        await this.form.updateFormConfig(formName, data);
    }

}
