import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, IsNull, MoreThan, Not, Repository } from "typeorm";
import { Challenge } from "./entities/challenge.entity";
import { ChallengeRegistration } from "./entities/challenge-registration.entity";
import { ChallengeCompletion } from "./entities/challenge-completion.entity";
import { CreateChallengeDTO } from "./dto/create-challenge.dto";
import { SubmitCompletionDTO } from "./dto/submit-completion.dto";
import { ValidateCompletionDTO } from "./dto/validate-completion.dto";
import { ValidateChallengeDTO } from "./dto/validate-challenge.dto";
import { User, Role } from "../Users/entities/user.entity";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ChallengesService {
    constructor(
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
        @InjectRepository(ChallengeRegistration)
        private readonly registrationRepo: Repository<ChallengeRegistration>,
        @InjectRepository(ChallengeCompletion)
        private readonly completionRepo: Repository<ChallengeCompletion>,
    ) {}

    async findPendingChallenges(page = 1, limit = 5, user: User): Promise<{ data: Challenge[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;

        let whereCondition: FindOptionsWhere<Challenge>[] | FindOptionsWhere<Challenge> = { status: "PENDING" };
        if (user.role !== Role.ADMIN) {
            whereCondition = [
                { status: "PENDING", irisCode: user.irisCode },
                { status: "PENDING", irisCode: "all" }
            ];
        }

        const [data, total] = await this.challengeRepo.findAndCount({
            where: whereCondition,
            order: { createdAt: "DESC" },
            skip: offset,
            take: limit,
            relations: ["author", "registrations", "completions"],
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findAllChallenges(page = 1, limit = 10, user: User): Promise<{ data: Challenge[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;

        let whereCondition: FindOptionsWhere<Challenge>[] | FindOptionsWhere<Challenge> = {
            status: "APPROVED",
            endDate: MoreThan(new Date()),
        };
        if (user.role !== Role.ADMIN) {
            whereCondition = [
                { status: "APPROVED", endDate: MoreThan(new Date()), irisCode: user.irisCode },
                { status: "APPROVED", endDate: MoreThan(new Date()), irisCode: "all" }
            ];
        }

        const [data, total] = await this.challengeRepo.findAndCount({
            where: whereCondition,
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

    async findPendingCompletions(page = 1, limit = 5, user: User): Promise<{ data: ChallengeCompletion[]; total: number; page: number; lastPage: number }> {
        const offset = (page - 1) * limit;

        const queryBuilder = this.completionRepo.createQueryBuilder("completion")
            .leftJoinAndSelect("completion.user", "user")
            .leftJoinAndSelect("completion.challenge", "challenge")
            .where("completion.validated = :validated", { validated: false })
            .andWhere("completion.rejectedReason IS NULL");

        if (user.role != Role.ADMIN) {
            queryBuilder.andWhere("(challenge.irisCode = :irisCode OR challenge.irisCode = 'all')", { irisCode: user.irisCode });
        }

        queryBuilder.orderBy("completion.createdAt", "DESC")
            .skip(offset)
            .take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async createChallenge(createChallengeDTO: CreateChallengeDTO, author: User): Promise<Challenge> {
        const { title, description, startDate, endDate, successCriteria } = createChallengeDTO;

        let irisCode = author.irisCode;
        let irisName = author.irisName;
        if (author.role === "admin") {
            irisCode = "all";
            irisName = "all";
        }

        const challenge = this.challengeRepo.create({
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            successCriteria,
            author,
            irisCode,
            irisName,
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
            relations: ["author", "registrations", "registrations.user", "completions", "completions.user"],
        });

        if (!challenge) {
            throw new NotFoundException("Challenge not found.");
        }

        if (challenge.registrations.some(r => r.user.id === user.id)) {
            throw new BadRequestException("Already registered");
        }

        if (challenge.completions.some(c => c.user.id === user.id && c.validated)) {
            throw new BadRequestException("You already have a validated completion for this challenge and can't register again.");
        }

        if (challenge.author.id === user.id) {
            throw new BadRequestException("The author of a challenge cannot register for their own challenge.");
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
            relations: ["author", "registrations", "registrations.user"],
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

        if (validateCompletionDTO.validated) {
            completion.validated = true;
            completion.rejectedReason = null;
        } else {
            completion.validated = false;
            completion.rejectedReason = validateCompletionDTO.rejectedReason;
        }

        completion.reviewedAt = new Date();
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
            challenge.rejectedReason = validateChallengeDTO.rejectedReason!;
        }

        challenge.reviewedAt = new Date();
        return this.challengeRepo.save(challenge);
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanChallengesOfFormersUsers() {
        const challenges = await this.challengeRepo.find({ relations: ["author"] });
        for (const challenge of challenges) {
            if (!challenge.author) {
                continue;
            }

            if (challenge.irisCode && challenge.author.irisCode && challenge.irisCode !== challenge.author.irisCode) {
                await this.challengeRepo.delete(challenge.id);
            }
        }
    }
}
