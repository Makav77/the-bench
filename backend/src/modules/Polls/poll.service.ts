import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, FindOptionsWhere } from "typeorm";
import { Poll } from "./entities/poll.entity";
import { PollOption } from "./entities/poll-option.entity";
import { PollVote } from "./entities/poll-vote.entity";
import { CreatePollDTO, PollType } from "./dto/create-poll.dto";
import { VotePollDTO } from "./dto/vote-poll.dto";
import { User, Role } from "../Users/entities/user.entity";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class PollService {
    constructor(
        @InjectRepository(Poll)
        private readonly pollRepo: Repository<Poll>,
        @InjectRepository(PollOption)
        private readonly optionRepo: Repository<PollOption>,
        @InjectRepository(PollVote)
        private readonly voteRepo: Repository<PollVote>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async findAllPolls(page = 1, limit = 10, user: User): Promise<{ data: Poll[]; total: number; page: number; lastPage: number; }> {
        const offset = (page - 1) * limit;

        let whereCondition: FindOptionsWhere<Poll>[] | FindOptionsWhere<Poll> = {};
        if (user.role !== Role.ADMIN) {
            whereCondition = [
                { irisCode: user.irisCode },
                { irisCode: "all" }
            ];
    }

        const [data, total] = await this.pollRepo.findAndCount({
            where: whereCondition,
            order: { createdAt: "DESC" },
            relations: ["author", "votes"],
            skip: offset,
            take: limit,
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOnePoll(id: string): Promise<Poll> {
        const poll = await this.pollRepo.findOne({
            where: { id },
            relations: ["author", "options", "votes", "votes.voter", "options.votes"],
        });

        if (!poll) {
            throw new NotFoundException("Poll not found.");
        }

        poll.options.forEach(opt => {
            (opt as any).votesCount = opt.votes?.length ?? 0;
        })

        return poll;
    }

    async createPoll(createPollDTO: CreatePollDTO, author: User): Promise<Poll> {
        const { question, options, type, maxSelections, autoCloseAt } = createPollDTO;

        if (type === PollType.LIMITED && !maxSelections) {
            throw new BadRequestException("maxSelections required for LIMITED type.");
        }

        if (type === PollType.LIMITED) {
            if (maxSelections! > createPollDTO.options.length - 1) {
                throw new BadRequestException("The maximum number of answers cannot be greater than the number of options - 1.");
            }
        }

        let irisCode = author.irisCode;
        let irisName = author.irisName;
        if (author.role === "admin") {
            irisCode = "all";
            irisName = "all";
        }

        const pollData: Partial<Poll> = {
            question,
            type,
            maxSelections,
            manualClosed: false,
            author,
            irisCode,
            irisName,
        };

        if (autoCloseAt) {
            pollData.closesAt = new Date(autoCloseAt);
        }

        const poll = this.pollRepo.create(pollData);
        const saved = await this.pollRepo.save(poll);

        const opts = options.map(label =>
            this.optionRepo.create({ label, poll: saved })
        );
        await this.optionRepo.save(opts);
        return this.findOnePoll(saved.id);
    }

    async vote(id: string, votePollDTO: VotePollDTO, user: User): Promise<Poll> {
        const poll = await this.findOnePoll(id);
        if (user.role === Role.ADMIN || user.role === Role.MODERATOR) {
            throw new ForbiddenException("Administrators and moderators can't vote.");
        }
        if (poll.manualClosed || (poll.closesAt && poll.closesAt < new Date())) {
            throw new BadRequestException("Sondage closed.");
        }
        const prior = await this.voteRepo.findOne({
            where: {
                poll: { id },
                voter: { id: user.id }
            }
        });

        if (prior) {
            throw new BadRequestException("You have already voted.");
        }

        const optionsIds = votePollDTO.selectedOptionsIds;

        if (poll.type === PollType.SINGLE && optionsIds.length !== 1) {
            throw new BadRequestException("Single response required.")
        }

        if (poll.type === PollType.LIMITED && optionsIds.length > poll.maxSelections!) {
            throw new BadRequestException(`Maximum of ${poll.maxSelections} choices`);
        }

        for (const optId of optionsIds) {
            const opt = poll.options.find(o => o.id === optId);
            if (!opt) {
                throw new NotFoundException("Invalid option");
            }

            user.points += 1;
            await this.userRepo.save(user);
            const vote = this.voteRepo.create({ poll, option: opt, voter: user });
            await this.voteRepo.save(vote);
        }
        return this.findOnePoll(id);
    }

    async closePoll(id: string, user: User): Promise<Poll> {
        const poll = await this.findOnePoll(id);
        if (poll.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("Unauthorize to close poll.");
        }

        poll.manualClosed = true;
        return this.pollRepo.save(poll);
    }

    async removePoll(id: string, user: User): Promise<void> {
        const poll = await this.findOnePoll(id);
        if (poll.author.id !== user.id && user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
            throw new ForbiddenException("Unauthorize to delete poll.");
        }
        await this.pollRepo.delete(id);
    }

    @Cron(CronExpression.EVERY_HOUR)
    async cleanPollsOfFormersUsers() {
        const polls = await this.pollRepo.find({ relations: ["author"] });
        for (const poll of polls) {
            if (!poll.author) {
                continue;
            }

            if (poll.irisCode && poll.author.irisCode && poll.irisCode !== poll.author.irisCode) {
                await this.pollRepo.delete(poll.id);
            }
        }
    }
}
