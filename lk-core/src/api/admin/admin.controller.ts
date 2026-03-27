import { Body, Controller, Delete, ForbiddenException, Get, Param, Put, Request, Query } from '@nestjs/common';
import ResponseService from '../../services/response.service';
import { Post } from '@nestjs/common/decorators';
import AdminService from '../../services/admin.service';
import ApiService from '../../services/api.service';
import * as Crypto from "crypto";
import { FormatService } from '../../format/FormatService';
import { SearchParams } from '../SearchParams';
import validateRequest, { clearRequest } from '../validation/request.validator';
import { ResponseClean, ResponseRaw } from 'src/entity/Response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("Методы для админки")
@Controller("admin")
export class AdminController {
    constructor(
        private readonly responseService: ResponseService,
        private readonly adminService: AdminService,
        private readonly apiService: ApiService,
        private readonly format: FormatService,
    ) { }

    @ApiBearerAuth("Токен Keycloak")
    @Get("/:formName/am-i-admin")
    async amIAdmin(@Request() req: { user: string }): Promise<boolean> {
        return this.adminService.isAdmin(req.user);
    }

    @ApiBearerAuth("Токен Keycloak")
    @Get("/:formName/get-roles")
    async getRoles(
        @Request() req: { user: string },
        @Param('formName') formName: string,
    ) {
        return {
            admin: await this.adminService.isAdmin(req.user),
            moderator: await this.adminService.isModerator(req.user, formName),
        };
    }

    @ApiBearerAuth("Токен Keycloak")
    @Get("/:formName/submissions")
    async getMany(
        @Request() req: { user: string },
        @Query() query: SearchParams,
        @Param('formName') formName: string,
    ): Promise<{ data: ResponseClean[], count: number }> {
        const isAdmin = await this.adminService.isModerator(req.user, formName);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        else return this.responseService.getMany(formName, query.skip, query.take, query.asc, query.order, query.search);
    }

    @ApiBearerAuth("Токен Keycloak")
    @Get("/:formName/submissions/:id")
    async getById(
        @Request() req: { user: string },
        @Param('id') id: string,
        @Param('formName') formName: string,
    ) {
        const isAdmin = await this.adminService.isModerator(req.user, formName);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        else return this.responseService.getOneById(formName, id);
    }

    @ApiBearerAuth("Токен Keycloak")
    @Post("/:formName/submissions")
    async create(
        @Request() req: { user: string },
        @Body() data: ResponseRaw,
        @Param('formName') formName: string,
    ) {
        const isAdmin = await this.adminService.isModerator(req.user, formName);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not a moderator.");

        const formFields = this.format.getAllFields(formName);
        validateRequest(data, formFields);
        clearRequest(data, formFields, {
            isApi: false, 
            isModerator: isAdmin,
            toCreate: true,
        });

        await this.responseService.create(formName, data, req.user);
    }

    @ApiBearerAuth("Токен Keycloak")
    @Delete("/:formName/submissions/:id")
    async delete(
        @Request() req: { user: string },
        @Param('id') id: string,
        @Param('formName') formName: string,
    ) {
        const isAdmin = await this.adminService.isModerator(req.user, formName);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        else await this.responseService.delete(formName, id);
    }

    @ApiBearerAuth("Токен Keycloak")
    @Put("/:formName/submissions/:id")
    async update(
        @Request() req: { user: string },
        @Param('id') id: string,
        @Param('formName') formName: string,
        @Body() data: ResponseRaw
    ) {
        const isAdmin = await this.adminService.isModerator(req.user, formName);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not a moderator.");

        const formFields = this.format.getAllFields(formName);
        validateRequest(data, formFields);
        clearRequest(data, formFields, {
            isApi: false, 
            isModerator: isAdmin,
            toCreate: false,
        });

        await this.responseService.update(formName, id, data);
    }

    @ApiBearerAuth("Токен Keycloak")
    @Get("/:formName/api")
    async getAPIKeys(
        @Request() req: { user: string },
    ) {
        const isAdmin = await this.adminService.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");

        return this.apiService.getAll();
    }

    @ApiBearerAuth("Токен Keycloak")
    @Post("/:formName/api")
    async addAPIKey(
        @Request() req: { user: string },
        @Body() data: {comment: string},
    ) {
        const isAdmin = await this.adminService.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");

        const key = Crypto.randomUUID();
        await this.apiService.addService({ authKey: key, comment: data.comment });

        return { authKey: key };
    }

    @ApiBearerAuth("Токен Keycloak")
    @Delete("/:formName/api")
    async deleteAPIKey(
        @Request() req: { user: string },
        @Body() data: {authKey: string},
    ) {
        const isAdmin = await this.adminService.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        await this.apiService.deleteService(data.authKey);
        return "OK";
    }
}
