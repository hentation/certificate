import { Injectable } from "@nestjs/common";
import axios from "axios";
import { CacheService } from "./CacheService";

@Injectable()
export class LKRoleService {
    constructor(
        private readonly cache: CacheService,
    ) { }

    private async getPermissionsAndRolesOfUserFromRoleAPI(user: string): Promise<{ roles: { user: string, service: string, role: string, context?: string }[], }> {
        const result = (await axios.get<{
            roles: { user: string, service: string, role: string, context?: string }[],
        }>
        (`${process.env.LK_ROLE_API_PATH}/api_v2/users/${user}`, { headers: { "Auth-Key": process.env.LK_ROLE_API_AUTHKEY } })).data;
        return {
            roles: result.roles,
        };
    }

    async getUsersOfService() {
        const result = (await axios.get<{
            "id": string,
            "guid": string,
            "fullName": string,
            "category": string,
            "type": string,
            "divisionTitle": string,
            "post": string,
            "qualification": string,
            "instituteTitle": string,
            "groupTitle": string,
        }[]>
        (`${process.env.LK_ROLE_API_PATH}/api_v2/users-of-service`, { headers: { "Auth-Key": process.env.LK_ROLE_API_AUTHKEY } })).data;
        return result;
    }

    // Эта штука вернёт одного пользователя несколько раз, если у этого пользователя назначены разные контексты/сущности у роли
    async getUsersOfRole(role: string) {
        const result = (await axios.get<{
            id: string,
            context: string,
            contextTitle: string,
            contextDescription: string | null,
            guid: string,
            fullName: string,
            category: string,
            type: string,
            divisionTitle: string,
            post: string,
            qualification: string,
            instituteTitle: string,
            groupTitle: string
        }[]>
        (`${process.env.LK_ROLE_API_PATH}/api_v2/roles/${role}/users`, { headers: { "Auth-Key": process.env.LK_ROLE_API_AUTHKEY } })).data;
        return result;
    }

    async getPermissionsAndRolesOfUser(user: string): Promise<{ roles: { user: string, service: string, role: string, context?: string }[], }> {
        return this.cache.get(`roles-and-permissions-of-${user}`, () => this.getPermissionsAndRolesOfUserFromRoleAPI(user));
    }
}