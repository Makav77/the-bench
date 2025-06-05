import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Not, Repository } from "typeorm";
import { Challenge } from "./entities/challenge.entity";
import { ChallengeRegistration } from "./entities/challenge-registration.entity";
import { ChallengeCompletion } from "./entities/challenge-completion.entity";
import { CreateChallengeDTO } from "./dto/create-challenge.dto";
import { SubmitCompletionDTO } from "./dto/submit-completion.dto";
import { ValidateCompletionDTO } from "./dto/validate-completion.dto";
import { ValidateChallengeDTO } from "./dto/validate-challenge.dto";
import { User, Role } from "../Users/entities/user.entity";

@Injectable()
export class ChallengesService {
    constructor(
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
        @InjectRepository(ChallengeRegistration)
        private readonly registrationRepo: Repository<ChallengeRegistration>,
        @InjectRepository(ChallengeCompletion)
        private readonly completionRepo: Repository<ChallengeCompletion>,
    ) { }

    async findAllChallenges(page = 1, limit = 10): Promise<{ data: Challenge[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;
        const [data, total] = await this.challengeRepo.findAndCount({
            where: { endDate: MoreThan(new Date()) },
            order: { endDate: "DESC" },
            skip: offset,
            take: limit,
            relations: ["author", "registrations", "completions"],
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOneChallenge(id: string): Promise<Challenge> {
        const challenge = await this.challengeRepo.findOne({
            where: { id },
            relations: ["author", "registrations", "registrations.user", "completions", "completions.user"],
        });
        if (!challenge) {
            throw new NotFoundException("Challenge not found.");
        }
        return challenge;
    }

    async findPendingChallenges(page = 1, limit = 5): Promise<{ data: Challenge[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;
        const [data, total] = await this.challengeRepo.findAndCount({
            where: { status: "PENDING" },
            order: { createdAt: "DESC" },
            skip: offset,
            take: limit,
            relations: ["author", "registrations", "completions"],
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async createChallenge(createChallengeDTO: CreateChallengeDTO, author: User): Promise<Challenge> {
        const { title, description, startDate, endDate, successCriteria } = createChallengeDTO;
        const challenge = this.challengeRepo.create({
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            successCriteria,
            author,
        });
        return this.challengeRepo.save(challenge);
    }


    async updateChallenge(id: string, updatedChallengeDTO: CreateChallengeDTO, user: User): Promise<Challenge> {
        const challenge = await this.challengeRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!challenge) {
            throw new NotFoundException("Challenge not found.");
        }

        if (challenge.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to edit this challenge.");
        }

        const updated = this.challengeRepo.merge(challenge, updatedChallengeDTO);
        return this.challengeRepo.save(updated);
    }

    async removeChallenge(id: string, user: User): Promise<void> {
        const challenge = await this.challengeRepo.findOne({
            where: { id },
            relations: ["author"]
        });

        if (!challenge) {
            throw new NotFoundException("Challenge not found.");
        }

        if (challenge.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to delete this challenge");
        }

        await this.challengeRepo.delete(id);
    }

    async subscribe(id: string, user: User): Promise<Challenge> {
        const challenge = await this.challengeRepo.findOne({
            where: { id },
            relations: ["author", "registrations", "registrations.user"],
        });

        if (!challenge) {
            throw new NotFoundException("Challenge not found.");
        }

        if (challenge.registrations.some(r => r.user.id === user.id)) {
            throw new BadRequestException("Already registered");
        }

        const register = this.registrationRepo.create({ challenge: challenge, user });
        await this.registrationRepo.save(register);
        return this.findOneChallenge(id);
    }

    async unsubscribe(id: string, user: User): Promise<Challenge> {
        const register = await this.registrationRepo.findOne({
            where: {
                challenge: { id },
                user: { id: user.id },
            },
        });

        if (!register) {
            throw new NotFoundException("Registration not found");
        }

        await this.registrationRepo.delete(register.id);
        return this.findOneChallenge(id);
    }

    async submitCompletion(id: string, submitCompletionDTO: SubmitCompletionDTO, user: User): Promise<ChallengeCompletion> {
        const challenge = await this.challengeRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!challenge) {
            throw new NotFoundException("Challenge not found.");
        }

        if (!challenge?.registrations.some(r => r.user.id === user.id)) {
            throw new ForbiddenException("You must register first.");
        }

        const completion = this.completionRepo.create({
            challenge: challenge,
            user,
            text: submitCompletionDTO.text,
            imageUrl: submitCompletionDTO.imageUrl,
        });

        return this.completionRepo.save(completion);
    }

    async validateCompletion(challengeId: string, completionId: string, validateCompletionDTO: ValidateCompletionDTO, user: User): Promise<ChallengeCompletion> {
        const challenge = await this.challengeRepo.findOne({
            where: { id: challengeId },
            relations: ["author"],
        });

        if (!challenge) {
            throw new NotFoundException("Challenge not found.");
        }

        if (challenge.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allowed to validate the completion.");
        }

        const completion = await this.completionRepo.findOne({
            where: { id: completionId },
            relations: ["user", "challenge"],
        });

        if (!completion) {
            throw new NotFoundException("Completion not found.");
        }

        completion.validated = validateCompletionDTO.validated;
        return this.completionRepo.save(completion);
    }

    async validateChallenge(id: string, validateChallengeDTO: ValidateChallengeDTO, user: User): Promise<Challenge> {
        const challenge = await this.challengeRepo.findOne({
            where: { id },
            relations: ["author"],
        });

        if (!challenge) {
            throw new NotFoundException("Challenge not found.");
        }

        if (challenge.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("You are not allow to validate this challenge.");
        }

        if (validateChallengeDTO.validated) {
            challenge.status = "APPROVED";
            challenge.rejectedReason = null;
        } else {
            challenge.status = "REJECTED";
            challenge.rejectedReason = validateChallengeDTO.rejectionReason!;
        }

        challenge.reviewAt = new Date();
        return this.challengeRepo.save(challenge);
    }
}
