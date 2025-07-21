import { IsInt, IsString, Min, Max } from 'class-validator';

export class AddWordDto {
  @IsString()
  word: string;

  @IsInt()
  @Min(1)
  @Max(3)
  difficulty: number;
}
