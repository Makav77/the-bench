import type { Request, Response, NextFunction } from 'express';

export const isAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(req as any).user) {
            res.status(401).send({ "message" : "Unauthorized" });
            return;
        }
        if ((req as any).user.role !== "admin" && (req as any).user.role !== "superadmin") {
            res.status(403).send({ "message": "Acces Forbidden from middleware" });
            return;
        }
        next();
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ "message": "Internal error" });
    }
}