import { SetMetadata } from "@nestjs/common";

export const PERMISSION_KEY = "permissionCode";
export const RequiredPermission= (code: string) =>
    SetMetadata(PERMISSION_KEY, code);
