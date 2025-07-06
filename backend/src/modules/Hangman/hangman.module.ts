import { Module } from '@nestjs/common';
import { HangmanController } from './hangman.controller';
import { HangmanService } from './hangman.service';

@Module({
  controllers: [HangmanController],
  providers: [HangmanService],
})
export class HangmanModule {}
