import type { Request, Response } from 'express';
import { AppDataSource } from '../db/database';
import { CreatePostingValidation } from './validators/posting/create-posting';
import  { PostingIdValidation } from "./validators/posting/posting-id"
import { Posting } from '../db/models/posting'

export const createPosting = async (req: Request, res: Response): Promise<void> => {
    const hostId = (req as any).user?.id;

    if (!hostId) {
        res.status(401).json({ message: "Unauthorized: No user found" });
        return;
    }
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const validation = CreatePostingValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send({ 
                message: validation.error.message,
                details: validation.error.details
            });
            return;
        }

        const createPostingRequest = validation.value;

        const postingRepository = queryRunner.manager.getRepository(Posting);
        
        const posting = await postingRepository.save({
            title: createPostingRequest.title,
            description: createPostingRequest.description,
            endDate: createPostingRequest.endDate,
            tags: createPostingRequest.tags,
            hostUser: hostId
        });


        await queryRunner.commitTransaction();

        res.status(201).send({
            message: "Posting successefully created",
            title: posting.title,
            description: posting.description,
            endDate: posting.endDate,
            tags: posting.tags,
            hostUser: hostId
        });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error(error);

        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    } finally {
        await queryRunner.release();
    }

}

export const getPostingsHandler = async (req: Request, res: Response) => {
    try {
        const postingRepository = AppDataSource.getRepository(Posting);
        const postings = await postingRepository.find();
        res.status(200).send(postings);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
}

export const getPostingByIDHandler = async (req: Request, res: Response) => {
    try {
        const validation = PostingIdValidation.validate(req.params);
        if (validation.error) {
            res.status(400).send({ 
                message: validation.error.message,
                details: validation.error.details
            });
            return;
        }

        const getPostingRequest = validation.value;
        const postingRepository = AppDataSource.getRepository(Posting);
        const posting = await postingRepository.findOne({
            where: { id: getPostingRequest.id }
        });
        if (!posting) {
            res.status(404).send({ message: "Resource not found" });
            return;
        }
        res.status(200).send(posting);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
}

export const deletePostingHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = PostingIdValidation.validate(req.params);
        if (validation.error) {
            res.status(400).send({ 
                message: validation.error.message,
                details: validation.error.details
            });
            return;
        }

        const deletePostingRequest = validation.value;
        const postingRepository = AppDataSource.getRepository(Posting);
        const postingFound = await postingRepository.findOneBy({ id: deletePostingRequest.id });
        if (!postingFound) {
            res.status(404).send({ message: "Resource not found" });
            return;
        }

        const user = (req as any).user; // replace with proper typing later if needed
        if (!user) {
            res.status(401).send({ message: "Unauthorized" });
            return;
        }

        const isAdmin = user.role === 'admin'; // Assuming there's a role field
        const isHost = postingFound.userHost === user.id;

        if (!isAdmin && !isHost) {
            res.status(403).send({ message: "Forbidden: You can't delete this posting" });
            return;
        }

        const postingDeleted = await postingRepository.remove(postingFound);
        res.status(200).send(postingDeleted);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
}