import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { HangmanService } from './hangman.service';
import { AddWordDto } from './dto/add-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { DeleteWordDto } from './dto/delete-word.dto';

@Controller('hangman')
export class HangmanController {
  constructor(private readonly hangmanService: HangmanService) {}

  @Get('words')
  async getAllWords() {
    const result = await this.hangmanService.getAllWords();
    return result;
  }

  @Post('add-word')
  async addWord(@Body() dto: AddWordDto) {
    const result = await this.hangmanService.addWord(dto.word, dto.difficulty);
    return { success: true, result };
  }

  @Patch('update-word')
  async updateWord(@Body() dto: UpdateWordDto) {
    const result = await this.hangmanService.updateWord(dto.oldWord, dto.newWord, dto.difficulty);
    return { success: true, result };
  }

  @Delete('delete-word')
  async deleteWord(@Body() dto: DeleteWordDto) {
    const result = await this.hangmanService.deleteWord(dto.word);
    return { success: true, result };
  }
}
