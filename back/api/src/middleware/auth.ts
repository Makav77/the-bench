import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { AppDataSource } from "../db/database";
import { Token } from "../db/models/token";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader === undefined) {
            res.status(401).send({ message: "Unauthorized" });
            return;
        }

        const bearerSplit = authHeader.split(' ');
        if (bearerSplit.length < 2) {
            res.status(401).send({ message: "Unauthorized" });
            return;
        }

        const token = bearerSplit[1];
        const tokenRepository = AppDataSource.getRepository(Token);
        const tokenFound = await tokenRepository.findOne({
            where: { token },
            relations: ['user']
        });

        if (!tokenFound) {
            res.status(403).send({ message: "Access Forbidden" });
            return;
        }

        verify (token, "valuerandom", (err) => {
            if (err) {
                res.status(403).send({ message: "Access Forbidden" });
                return;
            }
            
            (req as any).user = tokenFound.user;
            next();
        })
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
}