import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "../decorator/require-permission.decorator";
import { PermissionsService } from "../permissions.service";
import { User } from "src/modules/Users/entities/user.entity";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
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

        const request = context.switchToHttp().getRequest();
        const user = request.user as User;

        const { restricted, expiresAt } = await this.permissionsService.isRestricted(user, code);

        if (restricted) {
            const formatted = expiresAt
                ? new Date(expiresAt).toLocaleString("fr-FR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                  })
                : "";
            throw new ForbiddenException(
                `Vous êtes banni de l’action “${code}” jusqu’à ${formatted}.`
            );
        }
        return true;
    }
}
