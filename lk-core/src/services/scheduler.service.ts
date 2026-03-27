import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectDataSource } from "@nestjs/typeorm";
import { LKRoleService } from "src/auth/lk-role.service";
import { ResponseClean } from "src/entity/Response";
import { DataSource } from "typeorm";
import { LkNotificationService } from "./notification.service";

@Injectable()
export class SchedulerService {
    constructor(
        @InjectDataSource() private readonly ds: DataSource,
        private readonly lkRole: LKRoleService,
        private readonly notifications: LkNotificationService,
    ) {}

    private readonly logger = new Logger(SchedulerService.name);

    @Cron("0 9 * * 1")
    async notificateAboutNewForms() {
        const forms = await this.ds.createQueryBuilder().select().from("contacts", "form").where({
            status: "Не обработано",
        }).getRawMany<ResponseClean>();
        if (forms.length > 0) {
            const moderators = await this.lkRole.getUsersOfRole("moderator").then(res => res.filter(x => x.context === "contacts"));
            for (const moderator of moderators) {
                await this.notifications.sendEmail(
                    "Заявки на изменение контактных данных",
                    `<p>В сервисе администрирования контактов есть не обработанные заявки (количество заявок: ${forms.length}).</p>
<p>Для модерации заявок перейдите в сервис <a href="${process.env.TEST_INSTANCE === "1" ? "https://lk-contacts-admin-test.my1.urfu.ru/contacts/submissions" : "https://lk-contacts-admin.my1.urfu.ru/contacts/submissions"}">по ссылке</a>.</p>`,
                    moderator.id,
                );
            }
        }
    }


    @Cron(CronExpression.EVERY_DAY_AT_10AM)
    handleCron() {
        this.logger.verbose("Доброе утро! Сейчас 10 часов утра");
    }
}