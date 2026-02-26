import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TranslateQueryDto {
  @IsString()
  filename!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startFrom: number = 0;
}
