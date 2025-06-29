import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Report } from "./entities/report.entity";
import { CreateReportDTO } from "./dto/create-report.dto";
import { UpdateReportStatusDTO } from "./dto/update-status.dto";
import { User, Role } from "../Users/entities/user.entity";

@Injectable()
export class ReportsService{
    constructor(
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async findAllReports(page = 1, limit = 5, user: User): Promise<{ data: Report[]; total: number; page: number; lastPage: number; }> {
        const offset = (page - 1) * limit;

        let whereCondition: FindOptionsWhere<Report> = {};
        if (user.role !== Role.ADMIN) {
            whereCondition = {
                ...whereCondition,
                irisCode: user.irisCode,
            };
        }

        const [data, total] = await this.reportRepo.findAndCount({
            where: whereCondition,
            order: { createdAt: "DESC" },
            skip: offset,
            take: limit,
            relations: ["reporter", "reportedUser", "treatedBy"],
        });

        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    async findOneReport(reportId: string): Promise<Report> {
        const report = await this.reportRepo.findOne({
            where: { id: reportId },
            relations: ["reporter", "reportedUser", "treatedBy"],
        });

        if (!report) {
            throw new NotFoundException("Report not found.");
        }

        return report;
    }

    async createReport(user: User, createReportDTO: CreateReportDTO): Promise<Report> {
        const { reportedUserId, reason, description, reportedContentId, reportedContentType } = createReportDTO;

        const reporter = await this.userRepo.findOneBy({ id: user.id });
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
            reportedContentId,
            reportedContentType,
            description: description ?? null,
            status: "PENDING",
            irisCode: user.irisCode,
            irisName: user.irisName,
        });
        return this.reportRepo.save(newReport);
    }

    async updateReportStatus(reportId: string, updateReportStatusDTO: UpdateReportStatusDTO, user: User): Promise<Report> {
        const report = await this.reportRepo.findOne({
            where: { id: reportId },
            relations: ["treatedBy"],
        });

        if (!report) {
            throw new NotFoundException("Report not found.");
        }

        if (user.role !== Role.ADMIN && report.irisCode !== user.irisCode) {
            throw new ForbiddenException("You are not allowed to manage reports from another iris.");
        }

        report.status = updateReportStatusDTO.status;
        report.treatedBy = user;
        return this.reportRepo.save(report);
    }

    async removeReport(reportId: string, user: User): Promise<void> {
        const report = await this.reportRepo.findOne({
            where: { id: reportId },
            relations: ["reporter"],
        });

        if (!report) {
            throw new NotFoundException("Report not found.");
        }

        if (user.role !== Role.ADMIN && report.irisCode !== user.irisCode) {
            throw new ForbiddenException("Not allowed to remove reports from another iris.");
        }

        await this.reportRepo.delete(reportId);
    }
}
