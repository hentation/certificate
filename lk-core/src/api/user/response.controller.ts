import { Body, Controller, Delete, ForbiddenException, Get, Param, Put, Request, StreamableFile, UnprocessableEntityException } from '@nestjs/common';
import ResponseService from '../../services/response.service';
import { Post, Query, Res } from '@nestjs/common/decorators';
import { FormatService } from '../../format/FormatService';
import AdminService from '../../services/admin.service';
import { SearchParams } from '../SearchParams';
import validateRequest, { clearRequest } from '../validation/request.validator';
import { ResponseClean, ResponseRaw } from 'src/entity/Response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MinioService } from 'src/services/minio.service';
import { Response } from 'express';
import * as contentDisposition from 'content-disposition';

@ApiTags("API (с фронтенда для пользователей)")
@Controller()
export class ResponseController {
    constructor(
        private readonly responseService: ResponseService,
        private readonly format: FormatService,
        private readonly adminService: AdminService,
        private readonly minioService: MinioService,
    ) { }

    @ApiBearerAuth("Токен Keycloak")
    @Get("/:formName/submissions")
    async getMany(
        @Request() req: { user: string },
        @Query() query: SearchParams,
        @Param('formName') formName: string,
    ): Promise<{ data: ResponseClean[], count: number }> {
        return this.responseService.getManyByUser(formName, req.user, query.skip, query.take, query.asc, query.order, query.search);
    }

    @Get(":formName/submissions/:id/download/:fieldName")
    async getFileOfField(
        @Request() req: { user: string },
        @Param('id') id: string,
        @Param('formName') formName: string,
        @Param('fieldName') fieldName: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const submission = await this.getById(req, id, formName);
        const result = await this.responseService.downloadFile(submission, fieldName, formName);

        res.set({
            "Access-Control-Expose-Headers": "Content-Disposition",
            'Content-Type': result.data.stat.metaData["content-type"],
            'Content-Disposition': contentDisposition(result.fileName),
        });
        return new StreamableFile(result.data.object);
    }

    @ApiBearerAuth("Токен Keycloak")
    @Get("/:formName/submissions/:id")
    async getById(
        @Request() req: { user: string },
        @Param('id') id: string,
        @Param('formName') formName: string,
    ) {
        const fields = this.format.getAllFields(formName);
        const isAdmin = await this.adminService.isModerator(req.user, formName);
        if (!isAdmin && fields?.specialFields?.includes("formSubmissionUser"))
            return this.responseService.getOneByIdAndUser(formName, req.user, id);

        return this.responseService.getOneById(formName, id);
    }


    @ApiBearerAuth("Токен Keycloak")
    @Post("/:formName/submissions")
    async create(
        @Request() req: { user: string },
        @Param('formName') formName: string,
        @Body() data: ResponseRaw,
    ) {
        const formFields = this.format.getAllFields(formName);
        validateRequest(data, formFields);
        clearRequest(data, formFields, {
            isApi: false, 
            isModerator: false,
            toCreate: true,
        });

        const result = await this.responseService.create(formName, data, req.user);
        if (!result)
            throw new UnprocessableEntityException("Could not create entity from the given data.");
    }

    @ApiBearerAuth("Токен Keycloak")
    @Delete("/:formName/submissions/:id")
    async delete(
        @Request() req: { user: string },
        @Param('id') id: string,
        @Param('formName') formName: string,
    ) {
        const fields = this.format.getAllFields(formName);
        const isAdmin = await this.adminService.isModerator(req.user, formName);
        if (!isAdmin && fields?.specialFields?.includes("formSubmissionUser")) {
            await this.responseService.deleteByUser(formName, req.user, id);
        }
        await this.responseService.delete(formName, id);
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
        const submitterOfForm = await this.responseService.getSubmitter(formName, id);

        if (!(isAdmin || submitterOfForm === req.user)) {
            throw new ForbiddenException();
        }

        const formFields = this.format.getAllFields(formName);
        validateRequest(data, formFields);
        clearRequest(data, formFields, {
            isApi: false, 
            isModerator: isAdmin,
            toCreate: false,
        });

        const result = await this.responseService.update(formName, id, data);
        if (!result)
            throw new UnprocessableEntityException("Could not update entity from the given data.");
    }
}