import { Body, Controller, NotFoundException, Param, Request, UnprocessableEntityException } from '@nestjs/common';
import ResponseService from '../../services/response.service';
import { Post } from '@nestjs/common/decorators';
import { FormatService } from '../../format/FormatService';
import validateRequest, { clearRequest } from '../validation/request.validator';
import { ResponseRaw } from 'src/entity/Response';
import { ApiTags } from '@nestjs/swagger';
import { FormService } from 'src/services/form.service';
import { Public } from 'src/auth/public';

@ApiTags("API (с фронтенда для пользователей)")
@Controller("public")
export class PublicResponseController {
    constructor(
        private readonly responseService: ResponseService,
        private readonly format: FormatService,
        private readonly form: FormService,
    ) { }

    @Public()
    @Post("/:formName/submissions")
    async create(
        @Request() req: { user: string },
        @Param('formName') formName: string,
        @Body() data: ResponseRaw,
    ) {
        if (!this.form.isFormPublic(formName)) throw new NotFoundException("Форма не найдена");
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
}