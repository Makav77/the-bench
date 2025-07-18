import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../reports.controller';
import { ReportsService } from '../reports.service';
import { JwtAuthGuard } from '../../Auth/guards/jwt-auth.guard';
import { IrisGuard } from '../../Auth/guards/iris.guard';
import { PermissionGuard } from '../../Permissions/guards/permission.guard';
import { CreateReportDTO } from '../dto/create-report.dto';
import { UpdateReportStatusDTO } from '../dto/update-status.dto';

describe('ReportsController', () => {
    let controller: ReportsController;
    const svc = {
        findAllReports: jest.fn(),
        findOneReport: jest.fn(),
        createReport: jest.fn(),
        updateReportStatus: jest.fn(),
        removeReport: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportsController],
            providers: [{ provide: ReportsService, useValue: svc }],
        })
        .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
        .overrideGuard(IrisGuard).useValue({ canActivate: () => true })
        .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
        .compile();

        controller = module.get<ReportsController>(ReportsController);
        jest.clearAllMocks();
    });

    it('GET /reports calls findAllReports', async () => {
        const page = 2, limit = 5;
        const userReq: any = { user: { id: 'u1' } };
        svc.findAllReports.mockResolvedValue({ data: [], total:0, page, lastPage:0 });
        const res = await controller.findAllReports(page, limit, userReq);
        expect(svc.findAllReports).toHaveBeenCalledWith(page, limit, userReq.user);
        expect(res.page).toBe(page);
    });

    it('GET /reports/:id returns resource', async () => {
        const rep = { id: 'r1' } as any;
        await expect(controller.findOneReport(rep)).resolves.toBe(rep);
    });

    it('POST /reports calls createReport', async () => {
        const dto: CreateReportDTO = {
            reportedUserId: 'u2',
            reason: 'r',
            reportedContentId: 'c1',
            reportedContentType: 'TYPE',
        };
        const userReq: any = { user: { id: 'u1' } };
        svc.createReport.mockResolvedValue({ id: 'r1' } as any);
        const out = await controller.createReport(dto, userReq);
        expect(svc.createReport).toHaveBeenCalledWith(userReq.user, dto);
        expect(out.id).toBe('r1');
    });

    it('PATCH /reports/:id/status calls updateReportStatus', async () => {
        const dto: UpdateReportStatusDTO = { status: 'VALIDATED' };
        const rep = { id: 'r1' } as any;
        svc.updateReportStatus.mockResolvedValue({ id: 'r1', status:'VALIDATED' } as any);
        const out = await controller.updateReportStatus(rep, dto, { user: {} } as any);
        expect(svc.updateReportStatus).toHaveBeenCalledWith('r1', dto, {});
        expect(out.status).toBe('VALIDATED');
    });

    it('DELETE /reports/:id calls removeReport', async () => {
        const rep = { id: 'r2' } as any;
        const userReq: any = { user: { id: 'u' } };
        await controller.removeReport(rep, userReq);
        expect(svc.removeReport).toHaveBeenCalledWith('r2', userReq.user);
    });
});
