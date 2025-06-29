import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { ReportsService } from '../reports.service';
import { Response, NextFunction } from 'express';
import { RequestWithResource } from 'src/modules/Utils/request-with-resource.interface';
import { Report } from '../entities/report.entity';

@Injectable()
export class LoadReportResourceMiddleware implements NestMiddleware {
    constructor(private readonly reportsService: ReportsService) {}

    async use(
        req: RequestWithResource<Report>,
        res: Response,
        next: NextFunction
    ) {
        const id = req.params.id;
        if (id) {
            const report = await this.reportsService.findOneReport(id);
            if (!report) {
                throw new NotFoundException("report not found");
            }
            req.resource = report;
        }
        next();
    }
}
