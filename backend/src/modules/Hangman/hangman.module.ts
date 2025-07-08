import { Module } from '@nestjs/common';
import { HangmanController } from './hangman.controller';
import { HangmanService } from './hangman.service';
import { HangmanInvite } from './entities/invite.entity';
import { HangmanInviteService } from './hangman-invite.service';
import { HangmanInviteController } from './hangman-invite.controller';
import { User } from '../Users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HangmanCleanupService } from './hangman-cleanup.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../Users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([HangmanInvite, User]), ChatModule, UserModule],
  controllers: [HangmanController, HangmanInviteController],
  providers: [HangmanService, HangmanInviteService, HangmanCleanupService, ChatGateway],
})
export class HangmanModule {}
