import { Module } from '@nestjs/common';
import { HangmanController } from './hangman.controller';
import { HangmanService } from './hangman.service';
import { HangmanInvite } from './entities/invite.entity';
import { HangmanInviteService } from './hangman-invite.service';
import { HangmanInviteController } from './hangman-invite.controller';
import { User } from '../Users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HangmanCleanupService } from './hangman-cleanup.service';
import { HangmanGateway } from './hangman.gateway';


@Module({
  imports: [TypeOrmModule.forFeature([HangmanInvite, User]),],
  controllers: [HangmanController, HangmanInviteController],
  providers: [HangmanService, HangmanInviteService, HangmanCleanupService, HangmanGateway],
})
export class HangmanModule {}
