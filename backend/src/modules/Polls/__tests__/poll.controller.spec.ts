import { Test, TestingModule } from '@nestjs/testing';
import { PollController } from '../poll.controller';
import { PollService } from '../poll.service';
import { JwtAuthGuard } from '../../Auth/guards/jwt-auth.guard';
import { IrisGuard } from '../../Auth/guards/iris.guard';
import { PermissionGuard } from '../../Permissions/guards/permission.guard';

describe('PollController', () => {
    let controller: PollController;
    const svc = {
        findAllPolls: jest.fn(),
        findOnePoll: jest.fn(),
        createPoll: jest.fn(),
        vote: jest.fn(),
        closePoll: jest.fn(),
        removePoll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PollController],
            providers: [{ provide: PollService, useValue: svc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
            .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get<PollController>(PollController);
        jest.clearAllMocks();
    });

    it('findAllPolls calls service', async () => {
        svc.findAllPolls.mockResolvedValue({ data: [], total: 0, page: 2, lastPage: 1 });
        const req = { user: { id: 'u' } } as any;
        const out = await controller.findAllPolls(2, 5, { user: req.user } as any);
        expect(svc.findAllPolls).toHaveBeenCalledWith(2, 5, req.user);
        expect(out.page).toBe(2);
    });

    it('findOnePoll returns resource', () => {
        const poll = { id: 'p1' } as any;
        return expect(controller.findOnePoll(poll)).resolves.toBe(poll);
    });

    it('createPoll calls service', async () => {
        const dto = { question: 'q', options: [], type: 'single' } as any;
        const user = { id: 'u' } as any;
        svc.createPoll.mockResolvedValue({ id: 'p' } as any);
        const out = await controller.createPoll(dto, { user } as any);
        expect(svc.createPoll).toHaveBeenCalledWith(dto, user);
        expect(out.id).toBe('p');
    });

    it('votePoll handles not found and success', async () => {
        const voteDto = { selectedOptionsIds: ['o1'] } as any;
        const user = { id: 'u' } as any;
        svc.findOnePoll.mockResolvedValue(null);
        await expect(controller.votePoll('x', voteDto, { user } as any)).rejects.toThrow();

        svc.findOnePoll.mockResolvedValue({ id: 'p' } as any);
        svc.vote.mockResolvedValue({ id: 'p' } as any);
        const out = await controller.votePoll('p', voteDto, { user } as any);
        expect(svc.vote).toHaveBeenCalledWith('p', voteDto, user);
        expect(out.id).toBe('p');
    });

    it('closePoll calls service', async () => {
        const poll = { id: 'p' } as any;
        svc.closePoll.mockResolvedValue(poll);
        const out = await controller.closePoll(poll, { user: { id: 'u' } } as any);
        expect(svc.closePoll).toHaveBeenCalledWith('p', { id: 'u' });
        expect(out).toBe(poll);
    });

    it('removePoll calls service', async () => {
        const poll = { id: 'p' } as any;
        svc.removePoll.mockResolvedValue(undefined);
        await controller.removePoll(poll, { user: { id: 'u' } } as any);
        expect(svc.removePoll).toHaveBeenCalledWith('p', { id: 'u' });
    });
});
