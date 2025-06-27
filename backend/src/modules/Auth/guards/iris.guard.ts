import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
import { User } from "src/modules/Users/entities/user.entity";

export interface RequestWithResource<T> extends Request {
    resource: T;
}

@Injectable()
export class IrisGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithResource<{ iris: string }>>();
        const user = request.user as User;

        if (user.role === "admin") {
            return true;
        }

        const resource = request.resource;

        if (!resource) {
            throw new ForbiddenException("Unable to verify the neighborhood associated with the resource.")
        }

        if (resource.iris !== user.irisCode) {
            throw new ForbiddenException("You can only access resources in your neighborhood.")
        }

        return true;
    }
}
