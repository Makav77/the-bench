import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { RefreshToken } from "./entities/refresh-token.entity";

@Injectable()
export class CleanupService {
    private readonly logger = new Logger(CleanupService.name);

    constructor(
        @InjectRepository(RefreshToken)
        private readonly rtRepo: Repository<RefreshToken>,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async purgeTokens() {
        const now = new Date();

        const expiredResult = await this.rtRepo.delete({
            expiresAt: LessThan(now),
        });

        const revokedResult = await this.rtRepo.delete({ revoked: true });

        this.logger.log(`Purge expirés = ${expiredResult.affected}, révoqués = ${revokedResult.affected}`);
    }
}
