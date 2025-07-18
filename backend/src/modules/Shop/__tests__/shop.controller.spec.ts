import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from '../shop.controller';
import { ShopService } from '../shop.service';
import { JwtAuthGuard } from '../../Auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExecutionContext } from '@nestjs/common';

describe('ShopController', () => {
    let controller: ShopController;
    const svc = {
        getAllBadgesWithUserInfo: jest.fn(),
        createBadge: jest.fn(),
        getUserBadges: jest.fn(),
        buyBadge: jest.fn(),
        deleteBadge: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShopController],
            providers: [{ provide: ShopService, useValue: svc }],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
            .compile();
        controller = module.get<ShopController>(ShopController);
        jest.clearAllMocks();
    });

    it('GET /shop/badges calls service', async () => {
        const userReq: any = { user: { id: 'u1' } };
        svc.getAllBadgesWithUserInfo.mockResolvedValue(['a']);
        const out = await controller.getAllBadgesWithUserInfo(userReq);
        expect(svc.getAllBadgesWithUserInfo).toHaveBeenCalledWith('u1');
        expect(out).toEqual(['a']);
    });

    describe('createBadge()', () => {
        const dto = { cost: 5, available: true };
        const file = { filename: 'img.png' } as Express.Multer.File;

        it('throws if no file', async () => {
            await expect(controller.createBadge(undefined as any, dto as any, { user: { role: 'admin' } } as any))
                .rejects.toThrow('Image file required');
        });

        it('throws if non-admin', async () => {
            await expect(controller.createBadge(file, dto as any, { user: { role: 'user' } } as any))
                .rejects.toThrow('Only admins can create badges');
        });

        it('happy path', async () => {
            svc.createBadge.mockResolvedValue({ id: 'b1' });
            const out = await controller.createBadge(file, dto as any, { user: { role: 'admin' } } as any);
            expect(svc.createBadge).toHaveBeenCalledWith(dto, '/uploads/badges/img.png');
            expect(out).toEqual({ id: 'b1' });
        });
    });

    it('GET /shop/user-badges calls service', async () => {
        const userReq: any = { user: { id: 'u2' } };
        svc.getUserBadges.mockResolvedValue(['x']);
        const out = await controller.getUserBadges(userReq);
        expect(svc.getUserBadges).toHaveBeenCalledWith('u2');
        expect(out).toEqual(['x']);
    });

    it('POST /shop/buy/:badgeId calls service', async () => {
        const userReq: any = { user: { id: 'u3' } };
        svc.buyBadge.mockResolvedValue({ success: true });
        const out = await controller.buyBadge('b1', userReq);
        expect(svc.buyBadge).toHaveBeenCalledWith('u3', 'b1');
        expect(out).toEqual({ success: true });
    });

    describe('deleteBadge()', () => {
        it('throws if non-admin', async () => {
            await expect(controller.deleteBadge('b2', { user: { role: 'user' } } as any))
                .rejects.toThrow('Only admins can delete badges');
        });
        it('happy path', async () => {
            svc.deleteBadge.mockResolvedValue({ success: true });
            const out = await controller.deleteBadge('b2', { user: { role: 'admin' } } as any);
            expect(svc.deleteBadge).toHaveBeenCalledWith('b2');
            expect(out).toEqual({ success: true });
        });
    });
});
