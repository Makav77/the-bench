import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../user.service';
import { User, Role } from '../entities/user.entity';
import { Event } from '../../Events/entities/event.entity';
import { ChallengeRegistration } from '../../Challenges/entities/challenge-registration.entity';
import { MarketItem } from '../../Market/entities/market.entity';
import { UserBadge } from '../../Shop/entities/user-badge.entity';
import { Badge } from '../../Shop/entities/badge.entity';
import { IrisService } from '../../Iris/iris.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

describe('UserService', () => {
    let service: UserService;
    let userRepo: any;
    let irisService: any;

    const mockUser = {
        id: 'u1',
        firstname: 'John',
        lastname: 'Doe',
        address: '123 rue Test',
        irisCode: 'X',
        irisName: 'Test',
        email: 'john@example.com',
        password: 'pw',
        dateOfBirth: new Date().toISOString(),
        profilePicture: '/uploads/profile/default.png',
        role: Role.USER,
        points: 0,
    };

    beforeEach(async () => {
        userRepo = {
            findOneBy: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            merge: jest.fn(),
        };
        const eventRepo = {};
        const challRegRepo = {};
        const marketRepo = {};
        const userBadgeRepo = {};
        const badgeRepo = {};
        irisService = { resolveIris: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: getRepositoryToken(User), useValue: userRepo },
                { provide: getRepositoryToken(Event), useValue: eventRepo },
                { provide: getRepositoryToken(ChallengeRegistration), useValue: challRegRepo },
                { provide: getRepositoryToken(MarketItem), useValue: marketRepo },
                { provide: getRepositoryToken(UserBadge), useValue: userBadgeRepo },
                { provide: getRepositoryToken(Badge), useValue: badgeRepo },
                { provide: IrisService, useValue: irisService },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    describe('findOne', () => {
        it('returns user if found', async () => {
            userRepo.findOneBy.mockResolvedValue(mockUser);
            await expect(service.findOne('u1')).resolves.toEqual(mockUser);
        });
        it('throws NotFoundException if missing', async () => {
            userRepo.findOneBy.mockResolvedValue(null);
            await expect(service.findOne('u1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('throws if missing iris', async () => {
            const dto = { ...mockUser, irisCode: undefined, irisName: undefined, password: 'pw' };
            jest.spyOn(bcrypt as any, 'hash').mockResolvedValue('h');
            await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
        });
        it('handles duplicate email error', async () => {
            const dto = { ...mockUser, password: 'pw' };
            jest.spyOn(bcrypt as any, 'hash').mockResolvedValue('h');
            userRepo.create.mockReturnValue(dto);
            userRepo.save.mockRejectedValue({ code: '23505' });
            await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
        });
        it('happy path', async () => {
            const dto = { ...mockUser, password: 'pw' };
            jest.spyOn(bcrypt as any, 'hash').mockResolvedValue('h');
            const created = { ...dto, password: 'h', profilePicture: '/uploads/profile/default.png' };
            userRepo.create.mockReturnValue(created);
            userRepo.save.mockResolvedValue(created);
            await expect(service.create(dto as any)).resolves.toEqual(created);
        });
    });

    describe('update', () => {
        it('updates address with iris resolution', async () => {
            const existing = { ...mockUser };
            userRepo.findOneBy.mockResolvedValue(existing);
            jest.spyOn(service, 'getIrisFromAddress').mockResolvedValue({ irisCode: 'Y', irisName: 'New' });
            userRepo.merge.mockImplementation((u, dto) => ({ ...u, ...dto }));
            userRepo.save.mockResolvedValue({ ...existing, irisCode: 'Y', irisName: 'New', address: '456 rue ABC' });
            const res = await service.update('u1', { address: '456 rue ABC' } as any);
            expect(res.irisCode).toBe('Y');
            expect(res.irisName).toBe('New');
            expect(res.address).toBe('456 rue ABC');
        });
        it('throws if user not found', async () => {
            userRepo.findOneBy.mockResolvedValue(null);
            await expect(service.update('u2', {} as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('removes user if exists', async () => {
            userRepo.delete.mockResolvedValue({ affected: 1 });
            await expect(service.remove('u1')).resolves.toBeUndefined();
        });
        it('throws if not found', async () => {
            userRepo.delete.mockResolvedValue({ affected: 0 });
            await expect(service.remove('u1')).rejects.toThrow(NotFoundException);
        });
    });
});
