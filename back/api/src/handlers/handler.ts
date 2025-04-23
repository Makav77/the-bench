import type { Application, Request, Response } from 'express';
import { createUser, login, logout, profile, deleteUser } from './auth';
import { getUsersHandler, getUserByIDHandler, deleteUserHandler } from './user';
import { createPosting, getPostingsHandler, getPostingByIDHandler, deletePostingHandler } from './posting';
import { authMiddleware } from '../middleware/auth';
import { isAdminMiddleware } from '../middleware/isAdmin';

export const initHandlers = (app: Application) => {
    app.get("/health", (_: Request, res: Response) => {
        res.send({ "message": "API is working" })
    })
    app.post("/auth/signup", createUser);
    app.post("/auth/login", login);
    app.post("/auth/logout", authMiddleware, logout);
    app.get("/auth/profile", authMiddleware, profile);
    app.delete("/auth/delete", authMiddleware, deleteUser)

    app.get("/users", authMiddleware, isAdminMiddleware, getUsersHandler);
    app.get("/users/:id", authMiddleware, isAdminMiddleware, getUserByIDHandler);
    app.delete("/users/:id", authMiddleware, isAdminMiddleware, deleteUserHandler);

    app.post("/postings", authMiddleware, createPosting);
    app.get("/postings", authMiddleware, getPostingsHandler);
    app.get("/postings/:id", authMiddleware, getPostingByIDHandler);
    app.delete("/postings/:id", authMiddleware, deletePostingHandler);
}