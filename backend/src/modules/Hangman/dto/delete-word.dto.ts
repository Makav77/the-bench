import { IsString } from 'class-validator';

export class DeleteWordDto {
  @IsString()
  word: string;
}
