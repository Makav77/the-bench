import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import bcrypt from "bcryptjs";
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }
        return user;
    }

    async searchUsers(query: string): Promise<{ id: string; firstname: string; lastname: string; }[]> {
        return this.userRepository
            .createQueryBuilder("user")
            .where('LOWER(user.firstname) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('LOWER(user.lastname) LIKE LOWER(:query)', { query: `%${query}%` })
            .select(['user.id', 'user.firstname', 'user.lastname'])
            .limit(10)
            .getMany();
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found.`);
        }
        return user;
    }

    async create(createUserDTO: CreateUserDTO): Promise<User> {
        try {
            createUserDTO.password = await bcrypt.hash(createUserDTO.password, 10);
            const user = this.userRepository.create(createUserDTO);
            return await this.userRepository.save(user);
        } catch (error) {
            if (error.code === "23505") {
                throw new ConflictException("Un utilisateur avec cet email existe déjà.");
            }
            throw error;
        }
    }

    async update(id: string, updateUserDTO: UpdateUserDTO): Promise<User> {
        const user = await this.findOne(id);
        const updated = this.userRepository.merge(user, updateUserDTO);
        return this.userRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }
        return;
    }
}
