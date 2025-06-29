import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { User } from "src/modules/Users/entities/user.entity";

@Injectable()
export class IrisGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user as User;
        const resource = req.resource;

        if (user.role === "admin") {
            return true;
        }

        if (!resource) {
            throw new ForbiddenException("Unable to verify the neighborhood associated with the resource.");
        }

        if (resource.irisCode === "all" || resource.irisCode === user.irisCode) {
            return true;
        }

        throw new ForbiddenException("You can only access resources in your neighborhood.");
    }
}
