import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { HangmanInvite } from './entities/invite.entity';

@Injectable()
export class HangmanCleanupService {
  private readonly logger = new Logger(HangmanCleanupService.name);

  constructor(
    @InjectRepository(HangmanInvite)
    private inviteRepo: Repository<HangmanInvite>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanupInvites() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const pendingResult = await this.inviteRepo.delete({
      status: 'pending',
      createdAt: LessThan(fiveMinutesAgo),
    });

    const acceptedResult = await this.inviteRepo.delete({
      status: 'accepted',
      createdAt: LessThan(oneHourAgo),
    });

    const declinedResult = await this.inviteRepo.delete({
      status: 'declined',
    });

    this.logger.log(`Cleanup done: pending=${pendingResult.affected}, accepted=${acceptedResult.affected}, declined=${declinedResult.affected}`);
  }
}
