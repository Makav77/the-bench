import { Test, TestingModule } from '@nestjs/testing';
import { ShopService } from '../shop.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { User } from '../../Users/entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ShopService', () => {
    let service: ShopService;
    let badgeRepo: any;
    let userBadgeRepo: any;
    let userRepo: any;

    beforeEach(async () => {
        badgeRepo = {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
        };
        userBadgeRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
        userRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
        };
        badgeRepo.save.mockImplementation(b => Promise.resolve(b));
        userRepo.save.mockImplementation(u => Promise.resolve(u));
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShopService,
                { provide: getRepositoryToken(Badge), useValue: badgeRepo },
                { provide: getRepositoryToken(UserBadge), useValue: userBadgeRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();
        service = module.get<ShopService>(ShopService);
    });

    describe('getAllBadgesWithUserInfo', () => {
        it('marque owned flags correctly', async () => {
            const badges = [{ id: 'b1' }, { id: 'b2' }];
            badgeRepo.find.mockResolvedValue(badges);
            userBadgeRepo.find.mockResolvedValue([{ badge: { id: 'b2' } }]);
            const res = await service.getAllBadgesWithUserInfo('u1');
            expect(res).toEqual([
                { id: 'b1', owned: false },
                { id: 'b2', owned: true },
            ]);
        });
    });

    describe('createBadge', () => {
        it('creates and saves badge', async () => {
            const dto = { cost: 10, available: true };
            badgeRepo.create.mockReturnValue({ foo: 'bar' });
            const res = await service.createBadge(dto as any, '/img.png');
            expect(badgeRepo.create).toHaveBeenCalledWith({ cost: 10, available: true, imageUrl: '/img.png' });
            expect(res).toEqual({ foo: 'bar' });
        });
    });

    describe('getUserBadges', () => {
        it('returns list of badges from userBadges', async () => {
            userBadgeRepo.find.mockResolvedValue([{ badge: { id: 'x' } }, { badge: { id: 'y' } }]);
            const res = await service.getUserBadges('u2');
            expect(res).toEqual([{ id: 'x' }, { id: 'y' }]);
        });
    });

    describe('buyBadge', () => {
        const badge = { id: 'b1', cost: 5, available: true };
        const user = { id: 'u1', points: 10 };
        beforeEach(() => {
            badgeRepo.findOne.mockResolvedValue(badge);
            userRepo.findOne.mockResolvedValue({ ...user });
        });

        it('throws if badge not found or unavailable', async () => {
            badgeRepo.findOne.mockResolvedValue(null);
            await expect(service.buyBadge('u1', 'bX')).rejects.toThrow(NotFoundException);
            badgeRepo.findOne.mockResolvedValue({ ...badge, available: false });
            await expect(service.buyBadge('u1', 'b1')).rejects.toThrow(NotFoundException);
        });

        it('throws if user not found', async () => {
            badgeRepo.findOne.mockResolvedValue(badge);
            userRepo.findOne.mockResolvedValue(null);
            await expect(service.buyBadge('uX', 'b1')).rejects.toThrow(NotFoundException);
        });

        it('throws if already owned', async () => {
            userRepo.findOne.mockResolvedValue(user);
            userBadgeRepo.findOne.mockResolvedValue({} as any);
            await expect(service.buyBadge('u1', 'b1')).rejects.toThrow(BadRequestException);
        });

        it('throws if insufficient points', async () => {
            userRepo.findOne.mockResolvedValue({ id: 'u1', points: 2 });
            userBadgeRepo.findOne.mockResolvedValue(null);
            await expect(service.buyBadge('u1', 'b1')).rejects.toThrow(BadRequestException);
        });

        it('happy path deducts points and grants badge', async () => {
            userRepo.findOne.mockResolvedValue({ id: 'u1', points: 10 });
            userBadgeRepo.findOne.mockResolvedValue(null);
            userBadgeRepo.create.mockReturnValue({ foo: 'bar' });
            const res = await service.buyBadge('u1', 'b1');
            expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ points: 5 }));
            expect(userBadgeRepo.save).toHaveBeenCalledWith({ foo: 'bar' });
            expect(res).toEqual({ success: true });
        });
    });

    describe('deleteBadge', () => {
        it('throws if badge not found', async () => {
            badgeRepo.findOne.mockResolvedValue(null);
            await expect(service.deleteBadge('x')).rejects.toThrow(NotFoundException);
        });
        it('happy path deletes badge and userBadges', async () => {
            badgeRepo.findOne.mockResolvedValue({ id: 'b1' } as any);
            const res = await service.deleteBadge('b1');
            expect(userBadgeRepo.delete).toHaveBeenCalledWith({ badge: { id: 'b1' } });
            expect(badgeRepo.delete).toHaveBeenCalledWith('b1');
            expect(res).toEqual({ success: true });
        });
    });
});
