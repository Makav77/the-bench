import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
import { User } from "src/modules/Users/entities/user.entity";

interface RequestWithRessource<T> extends Request {
    ressource: T;
}

@Injectable()
export class IrisGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithRessource<{ iris: string }>>();
        const user = request.user as User;

        if (user.role === "admin") {
            return true;
        }

        const ressource = request.ressource;

        if (!ressource) {
            throw new ForbiddenException("Unable to verify the neighborhood associated with the resource.")
        }

        if (ressource.iris !== user.iris) {
            throw new ForbiddenException("You can only access resources in your neighborhood.")
        }

        return true;
    }
}
