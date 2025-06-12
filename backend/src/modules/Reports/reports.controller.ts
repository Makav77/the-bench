import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards, Delete, Query, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { CreateReportDTO } from "./dto/create-report.dto";
import { UpdateReportStatusDTO } from "./dto/update-status.dto";
import { JwtAuthGuard } from "../Auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../Permissions/guards/permission.guard";
import { RequiredPermission } from "../Permissions/decorator/require-permission.decorator";
import { Report } from "./entities/report.entity";
import { Request } from "express";
import { User } from "../Users/entities/user.entity";

@Controller("reports")
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllReports(
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
    ): Promise<{ data: Report[]; total: number; page: number; lastPage: number; }> {
        return this.reportsService.findAllReports(page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOneReport(@Param("id") id: string): Promise<Report> {
        return this.reportsService.findOneReport(id);
    }

    @RequiredPermission("send_report")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Post()
    async createReport(
        @Body() createReportDTO: CreateReportDTO,
        @Req() req: Request,
    ): Promise<Report> {
        const reporterId = (req.user as any).id;
        const report = await this.reportsService.createReport(
            reporterId,
            createReportDTO,
        );
        return report;
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id/status")
    async updateReportStatus(
        @Param("id") id: string,
        @Body() updateReportStatus: UpdateReportStatusDTO,
        @Req() req: Request
    ): Promise<Report> {
        const treatingUser = req.user as User;
        return this.reportsService.updateReportStatus(id, updateReportStatus, treatingUser);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removeReport(
        @Param("id") id: string
    ): Promise<void> {
        await this.reportsService.removeReport(id);
    }
}
