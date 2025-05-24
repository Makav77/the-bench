import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { Challenge } from "./entities/challenge.entity";
import { CreateChallengeDTO } from "./dto/create-challenge.dto";
import { User, Role } from "../Users/entities/user.entity";


@Injectable()
export class ChallengesService {
    constructor(
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
    ) {}

    async findAllChallenges(page = 1, limit = 10): Promise<{ data: Challenge[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;
        const [data, total] = await this.challengeRepo.findAndCount({
            where: { endDate: MoreThan(new Date()) },
            order: { endDate: "DESC" },
            skip: offset,
            take: limit,
            relations: ["author", "registrations"],
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOneChallenge(id: string): Promise<Challenge> {
        const challenge = await this.challengeRepo.findOne({
            where: { id },
            relations: ["author", "registrations", "completions"],
        });
        if (!challenge) {
            throw new NotFoundException("Challenge not found.");
        }
        return challenge;
    }

    async create(createChallengeDTO: CreateChallengeDTO, author: User): Promise<Challenge> {
        const challenge = this.challengeRepo.create({ 
            ...createChallengeDTO,
            author,
        });
        return this.challengeRepo.save(challenge);
    }
}
