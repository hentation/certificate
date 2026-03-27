import { LKRoleService } from "src/auth/lk-role.service";
import { ForbiddenException, Injectable } from "@nestjs/common";

type role = Awaited<ReturnType<LKRoleService["getPermissionsAndRolesOfUser"]>>['roles'][number];

const roleToValidatorList = [
    "admin",
    "moderator"
] as const;
type expectedRoles = typeof roleToValidatorList[number];

@Injectable()
export default class RoleService {
    constructor(
        private readonly role: LKRoleService,
    ) { }
    private roles: Map<string, role[]> = new Map();

    private async roleToValidator(user: string, form: string, role: expectedRoles) {
        if (role === "admin") return this.isAdmin(user, form);
        if (role === "moderator") return (await this.isAdmin(user, form) || await this.isModerator(user, form));
        throw new ForbiddenException();
    }
    
    private async baseCheck(user: string, predicate: (role: role) => boolean): Promise<boolean> {
        return Boolean(this.roles.get(user)?.find(predicate))
        || await this.role.getPermissionsAndRolesOfUser(user).then(res => {
            return Boolean(res.roles.find(predicate));
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async isAdmin(user: string, _form?: string) {
        return this.baseCheck(user, r => r.role === "admin" && r.context === null);
    }

    async isModerator(user: string, form: string) {
        return (await this.baseCheck(user, r => r.role === "moderator" && r.context === form)
        || await this.isAdmin(user, form));
    }

    async assert(caller: string, form: string, roles: expectedRoles[]) {
        if ((await Promise.all(roles.map(role => this.roleToValidator(caller, form, role)))).some(x => x)) {
            return;
        }
        throw new ForbiddenException();
    }
}