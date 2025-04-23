import type { Request, Response } from 'express';
import { User } from '../db/models/user';
import { AppDataSource } from '../db/database';
import { UserIdValidation } from './validators/user/user-id';

export const getUsersHandler = async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();
        res.status(200).send(users);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
}

export const getUserByIDHandler = async (req: Request, res: Response) => {
    try {
        const validation = UserIdValidation.validate(req.params);
        if (validation.error) {
            res.status(400).send({ 
                message: validation.error.message,
                details: validation.error.details
            });
            return;
        }

        const getUserRequest = validation.value;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: getUserRequest.id }
        });
        if (!user) {
            res.status(404).send({ message: "Resource not found" });
            return;
        }
        res.status(200).send(user);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
}

export const deleteUserHandler = async (req: Request, res: Response) => {
    try {
        const validation = UserIdValidation.validate(req.params);
        if (validation.error) {
            res.status(400).send({ 
                message: validation.error.message,
                details: validation.error.details
            });
            return;
        }

        const deleteUserRequest = validation.value;
        const userRepository = AppDataSource.getRepository(User);
        const userFound = await userRepository.findOneBy({ id: deleteUserRequest.id });
        if (!userFound) {
            res.status(404).send({ message: "Resource not found" });
            return;
        }

        const userDeleted = await userRepository.remove(userFound);
        res.status(200).send(userDeleted);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
}