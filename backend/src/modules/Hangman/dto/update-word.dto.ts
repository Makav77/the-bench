import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class UpdateWordDto {
  @IsString()
  oldWord: string;

  @IsOptional()
  @IsString()
  newWord?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  difficulty?: number;
}
