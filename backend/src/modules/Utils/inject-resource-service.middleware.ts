import { Injectable, NestMiddleware, Inject, forwardRef, Type } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

type ServiceRequest<T> = Request & { [key: string]: T };

export function createInjectServiceMiddleware<TService>(serviceName: string, serviceClass: Type<TService>) {
    @Injectable()
    class InjectServiceMiddleware implements NestMiddleware {
        constructor(@Inject(forwardRef(() => serviceClass)) public readonly service: TService) {}

        use(req: ServiceRequest<TService>, response: Response, next: NextFunction) {
            req[serviceName] = this.service;
            next();
        }
    }
    return InjectServiceMiddleware;
}
