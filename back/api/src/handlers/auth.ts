import type { Request, Response } from 'express';
import { CreateUserValidation } from './validators/auth/create-user';
import { LoginUserValidation } from './validators/auth/login';
import { compare, hash } from 'bcrypt';
import { AppDataSource } from '../db/database';
import { User } from '../db/models/user';
import { QueryFailedError } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { Token } from '../db/models/token';
import { verify } from 'jsonwebtoken';
import { format } from 'date-fns';

interface DecodedToken {
    userId: number;
    email: string;
    role: string;
}

export const createUser = async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const validation = CreateUserValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send({ 
                message: validation.error.message,
                details: validation.error.details
            });
            return;
        }

        const createUserRequest = validation.value;
        const passwordHash = await hash(createUserRequest.password, 10);

        const userRepository = queryRunner.manager.getRepository(User);
        
        const user = await userRepository.save({
            firstname: createUserRequest.firstname,
            lastname: createUserRequest.lastname,
            email: createUserRequest.email,
            password: passwordHash,
            dateOfBirth: createUserRequest.dateOfBirth,
            profilePicture: "",
            role: createUserRequest.role
        });


        await queryRunner.commitTransaction();

        res.status(201).send({
            message: "User successefully created",
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            role: user.role
        });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error(error);

        if (error instanceof QueryFailedError && error.driverError.code === '23505') {
            res.status(400).send('Email already exists');
            return;
        }
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    } finally {
        await queryRunner.release();
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const validation = LoginUserValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send({ 
                message: validation.error.message,
                details: validation.error.details
            });
            return;
        }

        const loginRequest = validation.value;

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { email: loginRequest.email }
        });
        if (!user) {
            res.status(401).send('Invalid email or password');
            return;
        }
        const isValid = await compare(loginRequest.password, user.password);
        if (!isValid) {
            res.status(400).send({ message : "Email or password invalid" });
            return;
        }

        const secret = "valuerandom";
        const token = sign({
            userId: user.id,
            email: user.email,
            role: user.role },
            secret, { expiresIn: '1h' }
        );
        const tokenRepository = AppDataSource.getRepository(Token);
        const tokenCreated = await tokenRepository.save({ token, user });
        res.status(201).send({ token: (await tokenCreated).token });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal pointer variable" });
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        const tokenRepository = AppDataSource.getRepository(Token);
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).send({ message: "No token provided" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const tokenEntry = await tokenRepository.findOneBy({ token });
        if (!tokenEntry) {
            res.status(401).send({ message: "Invalid token" });
            return;
        }
        await tokenRepository.remove(tokenEntry);
        res.status(200).send({ message: "Logout successful" });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
};

export const profile = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).send({ message: "No token provided" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const secret = "valuerandom";
        let decoded: DecodedToken;

        console.log("Token recieved : ", token);

        try {
            decoded = verify(token, secret) as DecodedToken;
        } catch (error) {
            if (error instanceof Error) {
                console.log("Error while decoding the token:", error.message);
            } else {
                console.log("Error while decoding the token::", error);
            }
            res.status(400).send({ message: "Invalid or expired token" });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: decoded.userId });

        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        const formattedDate = format(new Date(user.dateOfBirth), 'dd/MM/yyyy');

        res.status(200).send({
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            dateOfBirth: formattedDate
        });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        await AppDataSource.getRepository(Token).delete({ user: { id: user.id } });
        await AppDataSource.getRepository(User).delete({ id: user.id });

        res.status(200).send({ message: "User succesefully deleted" });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        res.status(500).send({ message: "Internal error" });
    }
}