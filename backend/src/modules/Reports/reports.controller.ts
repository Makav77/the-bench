import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards, Delete, Query, DefaultValuePipe, ParseIntPipe, NotFoundException } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { CreateReportDTO } from "./dto/create-report.dto";
import { UpdateReportStatusDTO } from "./dto/update-status.dto";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../Permissions/guards/permission.guard";
import { RequiredPermission } from "../Permissions/decorator/require-permission.decorator";
import { Report } from "./entities/report.entity";
import { User } from "../Users/entities/user.entity";
import { IrisGuard } from "../Auth/guards/iris.guard";
import { RequestWithResource } from "../Auth/guards/iris.guard";

@Controller("reports")
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllReports(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Req() req: RequestWithResource<Report>
    ): Promise<{ data: Report[]; total: number; page: number; lastPage: number; }> {
        const user = req.user as User;
        return this.reportsService.findAllReports(page, limit, user);
    }

    @UseGuards(JwtAuthGuard, IrisGuard)
    @Get(":id")
    async findOneReport(
        @Param("id") id: string,
        @Req() req: RequestWithResource<Report>
    ): Promise<Report> {
        const report = await this.reportsService.findOneReport(id);

        if (!report) {
            throw new NotFoundException("Report not found.");
        }

        req.resource = report;
        return report;
    }

    @RequiredPermission("send_report")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Post()
    async createReport(
        @Body() createReportDTO: CreateReportDTO,
        @Req() req: RequestWithResource<Report>
    ): Promise<Report> {
        const user = req.user as User;
        return this.reportsService.createReport(user, createReportDTO);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id/status")
    async updateReportStatus(
        @Param("id") id: string,
        @Body() updateReportStatus: UpdateReportStatusDTO,
        @Req() req: RequestWithResource<Report>
    ): Promise<Report> {
        const report = await this.reportsService.findOneReport(id);

        if (!report) {
            throw new NotFoundException("Report not found.");
        }

        req.resource = report;
        const user = req.user as User;
        return this.reportsService.updateReportStatus(id, updateReportStatus, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeReport(
        @Param("id") id: string,
        @Req() req: RequestWithResource<Report>
    ): Promise<void> {
        const report = await this.reportsService.findOneReport(id);

        if (!report) {
            throw new NotFoundException("Report not found.");
        }

        req.resource = report;
        const user = req.user as User;
        await this.reportsService.removeReport(id, user);
    }
}
