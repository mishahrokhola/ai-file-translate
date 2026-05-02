import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FileDownloadQueryDto {
  @IsOptional()
  @IsEnum(['original', 'translated', 'marked'], { message: 'variant must be one of: original, translated, marked' })
  @ApiProperty({ enum: ['original', 'translated', 'marked'], required: false, default: 'original' })
  variant: 'original' | 'translated' | 'marked' = 'original';
}
