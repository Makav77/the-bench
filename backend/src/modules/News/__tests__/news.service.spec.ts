import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NewsService } from '../news.service';
import { News } from '../news.schema';
import { User } from '../../Users/entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('NewsService', () => {
    let service: NewsService;
    let newsModel: any;
    let userRepo: any;

    beforeEach(async () => {
        newsModel = jest.fn().mockImplementation((doc) => ({
            ...doc,
            save: jest.fn(),
            deleteOne: jest.fn(),
        }));
        newsModel.find = jest.fn();
        newsModel.countDocuments = jest.fn();
        newsModel.findById = jest.fn();
        newsModel.deleteOne = jest.fn();

        userRepo = { find: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NewsService,
                { provide: getModelToken(News.name), useValue: newsModel },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();

        service = module.get(NewsService);
    });

    it('findAllNews maps totalLikes and uses correct filter', async () => {
        const chain: any = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([{ id: '1', likedBy: ['u1'], status: 'APPROVED', published: true, irisCode: 'X' }]),
        };
        newsModel.find.mockReturnValue(chain);
        newsModel.countDocuments.mockResolvedValue(1);

        const user = { role: 'user', irisCode: 'X' } as any;
        const res = await service.findAllNews(2, 3, user);

        expect(newsModel.find).toHaveBeenCalledWith({
            status: 'APPROVED',
            published: true,
            irisCode: { $in: ['X', 'all'] },
        });
        expect(res.data[0].totalLikes).toBe(1);
        expect(res.page).toBe(2);
    });

    it('findOneNews resolves or throws', async () => {
        newsModel.findById.mockReturnValue({
            exec: jest.fn().mockResolvedValue({ id: '1' }),
        });
        await expect(service.findOneNews('1')).resolves.toEqual({ id: '1' });

        newsModel.findById.mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
        });
        await expect(service.findOneNews('x')).rejects.toThrow(NotFoundException);
    });

    it('createNews sets pending & published=false', async () => {
        const saveMock = jest.fn().mockResolvedValue({ status: 'PENDING', published: false });
        newsModel = jest.fn().mockImplementation((doc) => ({ ...doc, save: saveMock }));
        const module = await Test.createTestingModule({
            providers: [
                NewsService,
                { provide: getModelToken(News.name), useValue: newsModel },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();
        service = module.get(NewsService);

        const user = { id: 'u', firstname: 'F', lastname: 'L', profilePicture: 'P', irisCode: 'X', irisName: 'N', role: 'user' } as any;
        const dto = { title: 'T', content: 'C', authorId: 'u', tags: [], published: true, images: [] } as any;

        const res = await service.createNews(dto, user);
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toBe('PENDING');
        expect(res.published).toBe(false);
    });

    it('updateNews happy / errors', async () => {
        const doc: any = { irisCode: 'X', authorId: 'u', save: jest.fn() };
        newsModel.findById.mockReturnValue(Promise.resolve(doc));
        const user = { id: 'u', role: 'user', irisCode: 'X' } as any;

        await service.updateNews('1', { title: 'New' } as any, user);
        expect(doc.save).toHaveBeenCalled();

        newsModel.findById.mockReturnValue(Promise.resolve(null));
        await expect(service.updateNews('x', {} as any, user)).rejects.toThrow(NotFoundException);

        newsModel.findById.mockReturnValue(Promise.resolve({ irisCode: 'Y', authorId: 'u', save: jest.fn() }));
        await expect(service.updateNews('1', {} as any, user)).rejects.toThrow(ForbiddenException);
    });

    it('removeNews happy / errors', async () => {
        const doc: any = { irisCode: 'X', authorId: 'u', deleteOne: jest.fn().mockResolvedValue({}) };
        newsModel.findById.mockReturnValue(Promise.resolve(doc));
        const user = { id: 'u', role: 'user', irisCode: 'X' } as any;

        await expect(service.removeNews('1', user)).resolves.toBeUndefined();
        expect(doc.deleteOne).toHaveBeenCalled();

        newsModel.findById.mockReturnValue(Promise.resolve(null));
        await expect(service.removeNews('x', user)).rejects.toThrow(NotFoundException);
    });

    it('toggleLike and getLikes, with error paths', async () => {
        const doc1: any = { irisCode: 'X', likedBy: [], save: jest.fn() };
        newsModel.findById.mockReturnValue(Promise.resolve(doc1));
        const user = { id: 'u', role: 'user', irisCode: 'X' } as any;

        const t1 = await service.toggleLike('1', user);
        expect(t1.liked).toBe(true);
        expect(t1.totalLikes).toBe(1);

        doc1.likedBy = ['u'];
        const t2 = await service.toggleLike('1', user);
        expect(t2.liked).toBe(false);

        newsModel.findById.mockReturnValue(Promise.resolve(null));
        await expect(service.toggleLike('x', user)).rejects.toThrow(NotFoundException);

        newsModel.findById.mockReturnValue({
            lean: jest.fn().mockReturnValue(Promise.resolve({ irisCode: 'X', likedBy: ['u'] })),
        });
        const g = await service.getLikes('1', user);
        expect(g.liked).toBe(true);
        expect(g.totalLikes).toBe(1);

        newsModel.findById.mockReturnValue({
            lean: jest.fn().mockReturnValue(Promise.resolve(null)),
        });
        await expect(service.getLikes('x', user)).rejects.toThrow(NotFoundException);
    });

    it('findPendingNews & findAllPublished', async () => {
        const chainP: any = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([{ id: '1' }]),
        };
        newsModel.find.mockReturnValue(chainP);
        newsModel.countDocuments.mockResolvedValue(1);

        const user = { role: 'user', irisCode: 'X' } as any;
        const p = await service.findPendingNews(1, 2, user);
        expect((p.data[0] as any).id).toBe('1');

        const chainA: any = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([{ id: '2' }]),
        };
        newsModel.find.mockReturnValue(chainA);
        newsModel.countDocuments.mockResolvedValue(1);

        const a = await service.findAllPublished(3, 4);
        expect((a.data[0] as any).id).toBe('2');
    });

    it('validateNews happy / error', async () => {
        const doc: any = { irisCode: 'X', authorId: 'u', save: jest.fn().mockResolvedValue({ status: 'APPROVED', published: true }) };
        newsModel.findById.mockReturnValue(Promise.resolve(doc));

        const user = { id: 'u', role: 'user', irisCode: 'X' } as any;
        const v1 = await service.validateNews('1', { validated: true } as any, user);
        expect(v1.status).toBe('APPROVED');

        newsModel.findById.mockReturnValue(Promise.resolve(null));
        await expect(service.validateNews('x', {} as any, user)).rejects.toThrow(NotFoundException);
    });

    it('cleanNewsOfFormerUsers deletes only mismatches', async () => {
        userRepo.find.mockResolvedValue([{ id: 'u1', irisCode: 'X' }]);
        newsModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([
                { _id: 'n1', irisCode: 'Y', authorId: 'u1' },
                { _id: 'n2', irisCode: 'all', authorId: 'u1' },
            ]),
        });
        newsModel.deleteOne.mockResolvedValue({});

        await service.cleanNewsOfFormerUsers();
        expect(newsModel.deleteOne).toHaveBeenCalledWith({ _id: 'n1' });
    });
});
