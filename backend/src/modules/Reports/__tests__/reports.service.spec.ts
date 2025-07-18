import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Report } from '../entities/report.entity';
import { User, Role } from '../../Users/entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ReportsService', () => {
    let service: ReportsService;
    let reportRepo: any;
    let userRepo: any;

    beforeEach(async () => {
        reportRepo = {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
        reportRepo.save.mockImplementation((r: any) => Promise.resolve(r));
        userRepo = { findOneBy: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                { provide: getRepositoryToken(Report), useValue: reportRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();
        service = module.get<ReportsService>(ReportsService);
    });

    describe('findAllReports', () => {
        it('admin sees all', async () => {
            reportRepo.findAndCount.mockResolvedValue([[{ id: 'r1' }], 1]);
            const res = await service.findAllReports(2, 3, { role: Role.ADMIN } as any);
            expect(reportRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: {},
                skip: 3,
                take: 3,
            }));
            expect(res.page).toBe(2);
            expect(res.total).toBe(1);
        });

        it('user filtered by iris', async () => {
            reportRepo.findAndCount.mockResolvedValue([[], 0]);
            const res = await service.findAllReports(undefined, undefined, { role: Role.USER, irisCode: 'X' } as any);
            expect(reportRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: { irisCode: 'X' },
                skip: 0,
                take: 5,
            }));
            expect(res.lastPage).toBe(0);
        });
    });

    describe('findOneReport', () => {
        it('returns when found', async () => {
            reportRepo.findOne.mockResolvedValue({ id: 'r1' });
            await expect(service.findOneReport('r1')).resolves.toEqual({ id: 'r1' });
        });
        it('throws when not found', async () => {
            reportRepo.findOne.mockResolvedValue(null);
            await expect(service.findOneReport('x')).rejects.toThrow(NotFoundException);
        });
    });

    describe('createReport', () => {
        const dto = {
            reportedUserId: 'u2',
            reason: 'bad',
            reportedContentId: 'c1',
            reportedContentType: 'COMMENT',
            description: 'desc',
        } as any;
        it('happy path', async () => {
            const reporter = { id: 'u1' } as any;
            const reported = { id: 'u2' } as any;
            userRepo.findOneBy
                .mockResolvedValueOnce(reporter)
                .mockResolvedValueOnce(reported);
            reportRepo.create.mockReturnValue({ foo: 'bar' });
            const res = await service.createReport({ id: 'u1' } as any, dto);
            expect(userRepo.findOneBy).toHaveBeenNthCalledWith(1, { id: 'u1' });
            expect(userRepo.findOneBy).toHaveBeenNthCalledWith(2, { id: 'u2' });
            expect(reportRepo.save).toHaveBeenCalledWith({ foo: 'bar' });
        });
        it('throws if reporter missing', async () => {
            userRepo.findOneBy.mockResolvedValueOnce(null);
            await expect(service.createReport({ id: 'u1' } as any, dto)).rejects.toThrow(NotFoundException);
        });
        it('throws if reported user missing', async () => {
            userRepo.findOneBy
                .mockResolvedValueOnce({ id: 'u1' })
                .mockResolvedValueOnce(null);
            await expect(service.createReport({ id: 'u1' } as any, dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateReportStatus', () => {
        const dto = { status: 'VALIDATED' } as any;
        it('happy path for admin', async () => {
            const rep: any = { id: 'r1', irisCode: 'X', status: 'PENDING', treatedBy: null };
            reportRepo.findOne.mockResolvedValue(rep);
            const res = await service.updateReportStatus('r1', dto, { role: Role.ADMIN } as any);
            expect(rep.status).toBe('VALIDATED');
            expect(rep.treatedBy).toEqual({ role: Role.ADMIN });
            expect(res.status).toBe('VALIDATED');
        });
        it('happy path for same iris user', async () => {
            const rep: any = { id: 'r2', irisCode: 'X', status: 'PENDING', treatedBy: null };
            reportRepo.findOne.mockResolvedValue(rep);
            const res = await service.updateReportStatus('r2', { status: 'REJECTED' } as any, { role: Role.USER, irisCode: 'X' } as any);
            expect(res.status).toBe('REJECTED');
        });
        it('throws if not found', async () => {
            reportRepo.findOne.mockResolvedValue(null);
            await expect(service.updateReportStatus('x', dto, { role: Role.ADMIN } as any)).rejects.toThrow(NotFoundException);
        });
        it('throws if wrong iris', async () => {
            reportRepo.findOne.mockResolvedValue({ id: 'r3', irisCode: 'Y' } as any);
            await expect(service.updateReportStatus('r3', dto, { role: Role.USER, irisCode: 'X' } as any)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('removeReport', () => {
        it('admin can delete', async () => {
            reportRepo.findOne.mockResolvedValue({ id: 'r1', irisCode: 'X' } as any);
            await service.removeReport('r1', { role: Role.ADMIN } as any);
            expect(reportRepo.delete).toHaveBeenCalledWith('r1');
        });
        it('same iris user can delete', async () => {
            reportRepo.findOne.mockResolvedValue({ id: 'r2', irisCode: 'X' } as any);
            await service.removeReport('r2', { role: Role.USER, irisCode: 'X' } as any);
            expect(reportRepo.delete).toHaveBeenCalledWith('r2');
        });
        it('throws if not found', async () => {
            reportRepo.findOne.mockResolvedValue(null);
            await expect(service.removeReport('x', { role: Role.ADMIN } as any)).rejects.toThrow(NotFoundException);
        });
        it('throws if wrong iris', async () => {
            reportRepo.findOne.mockResolvedValue({ id: 'r3', irisCode: 'Y' } as any);
            await expect(service.removeReport('r3', { role: Role.USER, irisCode: 'X' } as any)).rejects.toThrow(ForbiddenException);
        });
    });
});
