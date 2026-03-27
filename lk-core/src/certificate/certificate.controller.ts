import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Request,
    Res,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CertificateService } from "./certificate.service";
import { CreateCertificateDto, UpdateCertificateDto } from "./certificate.dto";
import * as path from "path";
import * as fs from "fs";
import type { Response } from "express";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "certificates");

@ApiTags("Справки — пользователь")
@ApiBearerAuth("Токен Keycloak")
@Controller("certificates")
export class CertificateController {
    constructor(private readonly service: CertificateService) {}

    @ApiOperation({ summary: "Заказать справку" })
    @Post()
    create(
        @Request() req: { user: string },
        @Body() dto: CreateCertificateDto,
    ) {
        return this.service.create(req.user, dto);
    }

    @ApiOperation({ summary: "Список моих заявок" })
    @Get("my")
    findMy(@Request() req: { user: string }) {
        return this.service.findByUser(req.user);
    }

    @ApiOperation({ summary: "Просмотр одной своей заявки" })
    @Get("my/:id")
    findOne(
        @Request() req: { user: string },
        @Param("id") id: string,
    ) {
        return this.service.findOne(id, req.user);
    }

    /**
     * Киллер-фича: редактирование разрешено ТОЛЬКО при статусе «На доработке».
     * После сохранения статус автоматически сбрасывается в «Новая».
     */
    @ApiOperation({
        summary: "Исправить заявку (только статус «На доработке»)",
        description:
            "Доступно исключительно когда администратор вернул заявку на доработку. " +
            "После успешного сохранения статус автоматически меняется на «Новая».",
    })
    @Put("my/:id")
    update(
        @Request() req: { user: string },
        @Param("id") id: string,
        @Body() dto: UpdateCertificateDto,
    ) {
        return this.service.updateByUser(id, req.user, dto);
    }

    @ApiOperation({ summary: "Отменить заявку (только статус «Новая»)" })
    @Delete("my/:id")
    remove(
        @Request() req: { user: string },
        @Param("id") id: string,
    ) {
        return this.service.deleteByUser(id, req.user);
    }

    @ApiOperation({ summary: "Загрузить прикреплённый файл" })
    @Post("upload")
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: (_req, _file, cb) => {
                    if (!fs.existsSync(UPLOAD_DIR)) {
                        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
                    }
                    cb(null, UPLOAD_DIR);
                },
                filename: (_req, file, cb) => {
                    const ext = path.extname(file.originalname);
                    const stored = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
                    cb(null, stored);
                },
            }),
            limits: { fileSize: 20 * 1024 * 1024 },
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // multer декодирует имя файла из заголовка как latin1, перекодируем в utf-8
        const name = Buffer.from(file.originalname, 'latin1').toString('utf8');
        return { name, stored: file.filename };
    }

    @ApiOperation({ summary: "Скачать прикреплённый файл" })
    @Get("files/:filename")
    downloadFile(@Param("filename") filename: string, @Res() res: Response) {
        const filePath = path.join(UPLOAD_DIR, path.basename(filename));
        if (!fs.existsSync(filePath)) {
            throw new NotFoundException("Файл не найден");
        }
        // Явно разрешаем CORS для прямых fetch-запросов с фронтенда (8080 → 3000)
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.download(filePath);
    }
}
