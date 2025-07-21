import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { JwtAuthGuard } from '../../Auth/guards/jwt-auth.guard';
import { IrisGuard } from '../../Auth/guards/iris.guard';
import { PermissionGuard } from '../../Permissions/guards/permission.guard';

describe('PostsController', () => {
    let controller: PostsController;
    const svc = {
        findAllPosts: jest.fn(),
        findOnePost: jest.fn(),
        createPost: jest.fn(),
        updatePost: jest.fn(),
        removePost: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostsController],
            providers: [{ provide: PostsService, useValue: svc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
            .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
            .compile();
        controller = module.get<PostsController>(PostsController);
        jest.clearAllMocks();
    });

    it('GET /posts calls findAllPosts', async () => {
        svc.findAllPosts.mockResolvedValue({ data: [], total: 0, page: 1, lastPage: 0 });
        const req: any = { user: { id: 'u' } };
        const res = await controller.findAllPosts(1, 5, req);
        expect(svc.findAllPosts).toHaveBeenCalledWith(1, 5, req.user);
        expect(res.page).toBe(1);
    });

    it('GET /posts/:id returns resource', async () => {
        const post = { id: 'p1' } as any;
        await expect(controller.findOnePost(post)).resolves.toBe(post);
    });

    it('POST /posts calls createPost', async () => {
        const dto = { title: 't', description: 'd' } as any;
        const req: any = { user: { id: 'u' } };
        svc.createPost.mockResolvedValue({ id: 'p2' } as any);
        const res = await controller.createPost(dto, req);
        expect(svc.createPost).toHaveBeenCalledWith(dto, req.user);
        expect((res as any).id).toBe('p2');
    });

    it('PATCH /posts/:id calls updatePost', async () => {
        const dto = { title: 'n' } as any;
        const post = { id: 'p3' } as any;
        const req: any = { user: { id: 'u' } };
        svc.updatePost.mockResolvedValue({ id: 'p3' } as any);
        await controller.updatePost(post, dto, req);
        expect(svc.updatePost).toHaveBeenCalledWith('p3', dto, req.user);
    });

    it('DELETE /posts/:id calls removePost', async () => {
        const post = { id: 'p4' } as any;
        const req: any = { user: { id: 'u' } };
        await controller.removePost(post, req);
        expect(svc.removePost).toHaveBeenCalledWith('p4', req.user);
    });
});
