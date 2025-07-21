import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from '../posts.service';
import { Posts } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User, Role } from '../../Users/entities/user.entity';

describe('PostsService', () => {
    let service: PostsService;
    let repo: jest.Mocked<Repository<Posts>>;

    beforeEach(async () => {
        repo = {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        } as any;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                { provide: getRepositoryToken(Posts), useValue: repo },
            ],
        }).compile();
        service = module.get<PostsService>(PostsService);
    });

    it('findAllPosts admin without filter', async () => {
        const data = [{ id: 'p1' }] as any[];
        repo.findAndCount.mockResolvedValue([data, 1]);
        const admin = { role: Role.ADMIN } as any;
        const res = await service.findAllPosts(2, 3, admin);
        expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: {},
            skip: 3,
            take: 3,
        }));
        expect(res.data).toEqual(data);
        expect(res.page).toBe(2);
        expect(res.lastPage).toBe(1);
    });

    it('findAllPosts user with filter', async () => {
        const data = [{ id: 'p2' }] as any[];
        repo.findAndCount.mockResolvedValue([data, 2]);
        const user = { role: Role.USER, irisCode: 'X' } as any;
        const res = await service.findAllPosts(undefined, undefined, user);
        expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
            where: [
                { irisCode: 'X' },
                { irisCode: 'all' },
            ],
            skip: 0,
            take: 10,
        }));
        expect(res.total).toBe(2);
        expect(res.page).toBe(1);
        expect(res.lastPage).toBe(1);
    });

    it('findOnePost returns or throws', async () => {
        const post = { id: 'p1' } as any;
        repo.findOne.mockResolvedValue(post);
        await expect(service.findOnePost('p1')).resolves.toBe(post);
        repo.findOne.mockResolvedValue(null);
        await expect(service.findOnePost('x')).rejects.toThrow(NotFoundException);
    });

    it('createPost sets iris correctly', async () => {
        const dto = { title: 'T', description: 'D' } as any;
        const admin = { id: 'u', irisCode: 'X', irisName: 'N', role: Role.ADMIN } as any;
        const user = { id: 'v', irisCode: 'Y', irisName: 'M', role: Role.USER } as any;
        const createdAdmin = { id: 'a', ...dto, irisCode: 'all', irisName: 'all', author: admin } as any;
        repo.create.mockReturnValue(createdAdmin);
        repo.save.mockResolvedValue(createdAdmin);
        const resA = await service.createPost(dto, admin);
        expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ irisCode: 'all', irisName: 'all' }));
        expect(resA).toBe(createdAdmin);
        const createdUser = { id: 'b', ...dto, irisCode: 'Y', irisName: 'M', author: user } as any;
        repo.create.mockReturnValue(createdUser);
        repo.save.mockResolvedValue(createdUser);
        const resU = await service.createPost(dto, user);
        expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ irisCode: 'Y', irisName: 'M' }));
        expect(resU).toBe(createdUser);
    });

    it('updatePost happy and errors', async () => {
        const orig = { id: 'p', author: { id: 'u' } } as any;
        const updated = { ...orig, title: 'new' } as any;
        repo.findOne.mockResolvedValue(orig);
        repo.merge.mockReturnValue(updated);
        repo.save.mockResolvedValue(updated);
        const user = { id: 'u', role: Role.USER } as any;
        const res = await service.updatePost('p', { title: 'new' } as any, user);
        expect(repo.merge).toHaveBeenCalledWith(orig, { title: 'new' });
        expect(res).toBe(updated);
        repo.findOne.mockResolvedValue(null);
        await expect(service.updatePost('x', {} as any, user)).rejects.toThrow(NotFoundException);
        repo.findOne.mockResolvedValue({ id: 'p', author: { id: 'v' }, irisCode: 'X' } as any);
        await expect(service.updatePost('p', {} as any, user)).rejects.toThrow(ForbiddenException);
    });

    it('removePost happy and errors', async () => {
        const post = { id: 'p', author: { id: 'u' } } as any;
        repo.findOne.mockResolvedValue(post);
        const user = { id: 'u', role: Role.USER } as any;
        await expect(service.removePost('p', user)).resolves.toBeUndefined();
        repo.findOne.mockResolvedValue(null);
        await expect(service.removePost('x', user)).rejects.toThrow(ForbiddenException);
        repo.findOne.mockResolvedValue({ id: 'p', author: { id: 'v' } } as any);
        await expect(service.removePost('p', user)).rejects.toThrow(ForbiddenException);
    });
});
