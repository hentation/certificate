import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class LkNotificationService {
    async sendEmail(subject: string, content: string, recipient: string) {
        if (!process.env.LK_NOTIFICATION_URL) throw new InternalServerErrorException("Не задана переменная LK_NOTIFICATION_URL");
        if (!process.env.LK_NOTIFICATION_USER) throw new InternalServerErrorException("Не задана переменная LK_NOTIFICATION_USER");
        if (!process.env.LK_NOTIFICATION_PASSWORD) throw new InternalServerErrorException("Не задана переменная LK_NOTIFICATION_PASSWORD");

        return axios.post("/external/message/", {
            sender_id: (process.env.TEST_INSTANCE === "1" ? 4 : 1),
            channel: "email",
            subject: (process.env.TEST_INSTANCE === "1" ? "[ТЕСТ] " : "") + subject,
            content,
            recipient
        }, {
            baseURL: process.env.LK_NOTIFICATION_URL,
            auth: {
                username: process.env.LK_NOTIFICATION_USER,
                password: process.env.LK_NOTIFICATION_PASSWORD,
            }
        });
    }
}