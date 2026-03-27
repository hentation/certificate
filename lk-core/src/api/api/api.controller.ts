/* eslint-disable @typescript-eslint/require-await */
import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import ResponseService from '../../services/response.service';
import { Post, UseGuards } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { SearchParams } from '../SearchParams';
import { FormatService } from '../../format/FormatService';
import validateRequest, { clearRequest } from '../validation/request.validator';
import { ResponseClean, ResponseRaw } from 'src/entity/Response';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags("API (с бекенда)")
@Controller("api")
export class ApiController {
    constructor(
        private readonly responseService: ResponseService,
        private readonly format: FormatService) { }

    @ApiSecurity("API Auth-Key")
    @UseGuards(AuthGuard("auth-key"))
    @Get("/:formName/submissions")
    async getMany(
        @Query() query: SearchParams,
        @Param('formName') formName: string,
    ): Promise<{ data: ResponseClean[], count: number }> {
        return this.responseService.getMany(formName, query.skip, query.take, query.asc, query.order, query.search);
    }

    @ApiSecurity("API Auth-Key")
    @UseGuards(AuthGuard("auth-key"))
    @Get("/:formName/submissions/:id")
    async getById(
        @Param('id') id: string,
        @Param('formName') formName: string,
    ) {
        return this.responseService.getOneById(formName, id);
    }

    @ApiSecurity("API Auth-Key")
    @UseGuards(AuthGuard("auth-key"))
    @Post("/:formName/submissions")
    async create(
        @Body() data: ResponseRaw,
        @Param('formName') formName: string,
    ) {
        const formFields = this.format.getAllFields(formName);
        validateRequest(data, formFields);
        clearRequest(data, formFields, {
            isApi: true, 
            isModerator: false,
            toCreate: true,
        });

        await this.responseService.create(formName, data);
    }

    @ApiSecurity("API Auth-Key")
    @UseGuards(AuthGuard("auth-key"))
    @Delete("/:formName/submissions/:id")
    async delete(
        @Param('id') id: string,
        @Param('formName') formName: string,
    ) {
        await this.responseService.delete(formName, id);
    }

    @ApiSecurity("API Auth-Key")
    @UseGuards(AuthGuard("auth-key"))
    @Put("/:formName/submissions/:id")
    async update(
        @Param('id') id: string,
        @Body() data: ResponseRaw,
        @Param('formName') formName: string,
    ) {
        const formFields = this.format.getAllFields(formName);
        validateRequest(data, formFields);
        clearRequest(data, formFields, {
            isApi: true, 
            isModerator: false,
            toCreate: false,
        });

        await this.responseService.update(formName, id, data);
    }
}