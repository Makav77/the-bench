import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PollService } from '../poll.service';
import { Poll } from '../entities/poll.entity';
import { PollOption } from '../entities/poll-option.entity';
import { PollVote } from '../entities/poll-vote.entity';
import { User } from '../../Users/entities/user.entity';
import { CreatePollDTO, PollType } from '../dto/create-poll.dto';
import { VotePollDTO } from '../dto/vote-poll.dto';

describe('PollService', () => {
    let service: PollService;
    let pollRepo: jest.Mocked<Repository<Poll>>;
    let optionRepo: jest.Mocked<Repository<PollOption>>;
    let voteRepo: jest.Mocked<Repository<PollVote>>;
    let userRepo: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        pollRepo = {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        } as any;
        optionRepo = {
            create: jest.fn(),
            save: jest.fn(),
        } as any;
        voteRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        } as any;
        userRepo = {
            save: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PollService,
                { provide: getRepositoryToken(Poll), useValue: pollRepo },
                { provide: getRepositoryToken(PollOption), useValue: optionRepo },
                { provide: getRepositoryToken(PollVote), useValue: voteRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();

        service = module.get<PollService>(PollService);
    });

    it('findAllPolls for user', async () => {
        const data = [{ id: 'p1' }] as any[];
        pollRepo.findAndCount.mockResolvedValue([data, 1]);
        const user = { role: 'user', irisCode: 'X' } as any;
        const res = await service.findAllPolls(2, 5, user);
        expect(pollRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: [
                { irisCode: 'X' },
                { irisCode: 'all' }
            ],
            skip: 5,
            take: 5,
        }));
        expect(res.page).toBe(2);
        expect(res.data).toEqual(data);
    });

    it('findAllPolls for admin', async () => {
        pollRepo.findAndCount.mockResolvedValue([[], 0]);
        const admin = { role: 'admin' } as any;
        const res = await service.findAllPolls(undefined, undefined, admin);
        expect(pollRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: {},
            skip: 0,
            take: 10,
        }));
        expect(res.total).toBe(0);
    });

    it('findOnePoll returns votesCount and throws', async () => {
        const poll = {
            id: 'p',
            options: [
                { id: 'o1', votes: [1,2] },
                { id: 'o2', votes: [] },
            ],
        } as any;
        pollRepo.findOne.mockResolvedValue(poll);
        const res = await service.findOnePoll('p');
        expect((res.options[0] as any).votesCount).toBe(2);
        expect((res.options[1] as any).votesCount).toBe(0);

        pollRepo.findOne.mockResolvedValue(null);
        await expect(service.findOnePoll('x')).rejects.toThrow(NotFoundException);
    });

    it('createPoll validates LIMITED type', async () => {
        const author = { id: 'u', irisCode: 'X', irisName: 'N', role: 'user' } as any;
        const dto1 = { question: 'q', options: ['a','b'], type: PollType.LIMITED } as any;
        await expect(service.createPoll(dto1, author)).rejects.toThrow(BadRequestException);

        const dto2 = { question: 'q', options: ['a','b'], type: PollType.LIMITED, maxSelections: 2 } as any;
        await expect(service.createPoll(dto2, author)).rejects.toThrow(BadRequestException);
    });

    it('createPoll happy path', async () => {
        const author = { id: 'u', irisCode: 'X', irisName: 'N', role: 'user' } as any;
        const dto: CreatePollDTO = {
            question: 'q',
            options: ['a','b'],
            type: PollType.SINGLE,
        } as any;
        const created = { id: 'p' } as any;

        pollRepo.create.mockReturnValue(created);
        pollRepo.save.mockResolvedValue(created);
        optionRepo.create.mockReturnValue({} as any);
        optionRepo.save.mockResolvedValue([{}] as any);
        jest.spyOn(service, 'findOnePoll').mockResolvedValue(created);

        const res = await service.createPoll(dto, author);
        expect(pollRepo.save).toHaveBeenCalledWith(created);
        expect(optionRepo.save).toHaveBeenCalled();
        expect(res).toBe(created);
    });

    it('vote invalid and valid cases', async () => {
        const user = { id: 'u', role: 'user', points: 0, irisCode: 'X', irisName: 'N' } as any;
        const basePoll = {
            id: 'p',
            manualClosed: false,
            closesAt: new Date(Date.now() + 10000),
            type: PollType.SINGLE,
            maxSelections: 1,
            options: [{ id: 'o1' }],
            author: { id: 'a' },
        } as any;

        jest.spyOn(service, 'findOnePoll').mockResolvedValue(basePoll);

        await expect(service.vote('p', { selectedOptionsIds: [] } as VotePollDTO, user))
            .rejects.toThrow(BadRequestException);

        await expect(service.vote('p', { selectedOptionsIds: ['o1','o2'] } as any, user))
            .rejects.toThrow(BadRequestException);

        voteRepo.findOne.mockResolvedValue({} as any);
        await expect(service.vote('p', { selectedOptionsIds: ['o1'] } as VotePollDTO, user))
            .rejects.toThrow(BadRequestException);

        voteRepo.findOne.mockResolvedValue(null);
        basePoll.options = [];
        await expect(service.vote('p', { selectedOptionsIds: ['x'] } as VotePollDTO, user))
            .rejects.toThrow(NotFoundException);

        basePoll.options = [{ id: 'o1' }];
        basePoll.type = PollType.MULTIPLE;
        voteRepo.findOne.mockResolvedValue(null);
        voteRepo.create.mockReturnValue({} as any);
        voteRepo.save.mockResolvedValue({} as any);
        userRepo.save.mockResolvedValue(user);

        const result = await service.vote('p', { selectedOptionsIds: ['o1'] } as VotePollDTO, user);
        expect(voteRepo.create).toHaveBeenCalled();
        expect(user.points).toBe(1);
    });

    it('closePoll and removePoll cases', async () => {
        const poll = { id: 'p', author: { id: 'u' } } as any;
        jest.spyOn(service, 'findOnePoll').mockResolvedValue(poll);
        pollRepo.save.mockResolvedValue(poll);
        const user = { id: 'u', role: 'user' } as any;

        const closed = await service.closePoll('p', user);
        expect(closed).toBe(poll);

        const other = { id: 'p', author: { id: 'x' } } as any;
        jest.spyOn(service, 'findOnePoll').mockResolvedValue(other);
        await expect(service.closePoll('p', user)).rejects.toThrow(ForbiddenException);

        jest.spyOn(service, 'findOnePoll').mockResolvedValue(poll);
        await expect(service.removePoll('p', user)).resolves.toBeUndefined();

        jest.spyOn(service, 'findOnePoll').mockResolvedValue(other);
        await expect(service.removePoll('p', user)).rejects.toThrow(ForbiddenException);
    });

    it('cleanPollsOfFormersUsers deletes mismatches', async () => {
        const list = [
            { id: '1', author: null, irisCode: 'X' },
            { id: '2', author: { irisCode: 'X' }, irisCode: 'all' },
            { id: '3', author: { irisCode: 'Y' }, irisCode: 'Z' },
        ] as any[];
        pollRepo.find.mockResolvedValue(list);
        pollRepo.delete.mockResolvedValue({} as any);

        await service.cleanPollsOfFormersUsers();
        expect(pollRepo.delete).toHaveBeenCalledWith('3');
    });
});
