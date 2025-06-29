import { createParamDecorator, ExecutionContext, NotFoundException } from "@nestjs/common";

export const Resource = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const resource = request.resource;

    if (!resource) {
        throw new NotFoundException("Resource not found");
    }

    return resource;
});
