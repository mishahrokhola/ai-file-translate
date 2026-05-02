import { ApiProperty } from '@nestjs/swagger';

export class ErrorResultDto {
  @ApiProperty({ example: 'error', enum: ['error'] })
  status: 'error' = 'error' as const;

  @ApiProperty({ required: true })
  errorMessage: string;
}
