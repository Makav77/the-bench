import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from "@nestjs/common";
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

        if (!user) {
            throw new ForbiddenException("User not authenticated.");
        }

        let check;
        try {
            check = await this.permissionsService.isRestricted(user, code);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new ForbiddenException("Permission not recognized.");
            }
            throw error;
        }

        const { restricted, expiresAt, reason } = check;

        if (restricted) {
            let formattedDate: string;
            if (expiresAt) {
                formattedDate = new Date(expiresAt).toLocaleString("fr-FR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } else {
                formattedDate = "∞";
            }

            const actionText = code.toLowerCase().replace(/_/g, " ");
            const message = [
                `You are no longer allowed to ${actionText} until ${formattedDate}.`,
                reason ? `Reason: ${reason}` : null,
                "Contact a moderator or administrator for more information.",
            ]
                .filter((line) => line !== null)
                .join("\n");

            throw new ForbiddenException(message);
        }
        return true;
    }
}
