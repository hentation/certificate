import { Body, Controller, ForbiddenException, Get, Param, Put, Request, Query } from '@nestjs/common';
import AdminService from '../../services/admin.service';
import { SearchParams } from '../SearchParams';
import ShortenerService from 'src/services/shortener';
import { ApiBearerAuth, ApiHideProperty, ApiTags } from '@nestjs/swagger';

@ApiTags("Методы для админки")
@Controller("admin")
export class ShortenerController {
    constructor(
        private readonly adminService: AdminService,
        private readonly short: ShortenerService,
    ) { }

    @ApiBearerAuth("Токен Keycloak")
    @ApiHideProperty()
    @Get("/:formName/shortener")
    async getShortener(
        @Request() req: { user: string },
        @Param('formName') formName: string,
    ) {
        const isAdmin = await this.adminService.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        return this.short.getOneByFormName(formName);
    }

    @ApiBearerAuth("Токен Keycloak")
    @ApiHideProperty()
    @Put("/:formName/shortener") 
    async putShortener(
        @Request() req: { user: string },
        @Param('formName') formName: string,
        @Body() data: {short: string}
    ) {
        const isAdmin = await this.adminService.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        return this.short.update(formName, data.short);
    }

    @ApiBearerAuth("Токен Keycloak")
    @Put("/:formName/shortener")
    async deleteShortener(
        @Request() req: { user: string },
        @Query() query: SearchParams,
        @Param('formName') formName: string,
    ) {
        const isAdmin = await this.adminService.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException("Could not get data: the provided user is not an admin.");
        return this.short.delete(formName);
    }
}
