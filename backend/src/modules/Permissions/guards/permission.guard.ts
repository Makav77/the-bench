import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "../decorator/require-permission.decorator";
import { PermissionsService } from "../permissions.service";
import { Observable } from "rxjs";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @Inject(PermissionsService)
        private permissionsService: PermissionsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const code = this.reflector.get<string>(
            PERMISSION_KEY,
            context.getHandler(),
        );

        if (!code) {
            return true;
        }

        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const isRestricted = await this.permissionsService.isRestricted(user, code);

        if (isRestricted) {
            throw new ForbiddenException(`You are banned from performing this action (${code})`);
        }

        return true;
    }
}
