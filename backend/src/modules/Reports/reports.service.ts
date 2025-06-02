import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Report } from "./entities/report.entity";
import { CreateReportDTO } from "./dto/create-report.dto";
import { UpdateReportStatusDTO } from "./dto/update-status.dto";
import { User } from "../Users/entities/user.entity";

@Injectable()
export class ReportsService{
    constructor(
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async findAllReports(): Promise<Report[]> {
        const reports = this.reportRepo.find({
            relations: ["reporter", "reportedUser"],
            order: { createdAt: "DESC" },
        });

        if (!reports) {
            throw new NotFoundException("No reports found.");
        }

        return reports;
    }

    async findOneReport(reportId: string): Promise<Report> {
        const report = await this.reportRepo.findOne({
            where: { id: reportId },
            relations: ["reporter", "reportedUser"],
        });

        if (!report) {
            throw new NotFoundException("Report not found.");
        }

        return report;
    }

    async createReport(reportedId: string, createReportDTO: CreateReportDTO): Promise<Report> {
        const { reportedUserId, reason, description } = createReportDTO;

        const reporter = await this.userRepo.findOneBy({ id: reportedId });
        if (!reporter) {
            throw new NotFoundException("Reporter not found.");
        }

        const reportedUser = await this.userRepo.findOneBy({ id: reportedUserId });
        if (!reportedUser) {
            throw new NotFoundException("User to report not found.");
        }

        const newReport = this.reportRepo.create({
            reporter,
            reportedUser,
            reason,
            description: description ?? null,
            status: "PENDING",
        });
        return this.reportRepo.save(newReport);
    }

    async updateReportStatus(reportId: string, updateReportStatusDTO: UpdateReportStatusDTO): Promise<Report> {
        const report = await this.reportRepo.findOneBy({ id: reportId });
        if (!report) {
            throw new NotFoundException("Report not found.");
        }

        report.status = updateReportStatusDTO.status;
        return this.reportRepo.save(report);
    }

    async removeReport(reportId: string): Promise<void> {
        const report = await this.reportRepo.findOneBy({ id: reportId });
        if (!report) {
            throw new NotFoundException("Report not found.");
        }

        await this.reportRepo.delete(reportId);
    }
}
