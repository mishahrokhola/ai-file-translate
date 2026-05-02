import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ErrorResultDto } from '../dto/result.dto';

export class TranslateBookResultDto {
  @ApiProperty({ example: 'success', enum: ['success'] })
  status: 'success' = 'success' as const;
}

export class TranslateBookDataDto {
  @ApiProperty({ oneOf: [{ $ref: getSchemaPath(TranslateBookResultDto) }, { $ref: getSchemaPath(ErrorResultDto) }] })
  result: TranslateBookResultDto | ErrorResultDto;

  @ApiProperty({ example: 45, description: 'Відсоток прогресу' })
  progress: number;

  @ApiProperty({ example: 1, description: 'Індекс поточного чанка' })
  chunkIndex: number;

  @ApiProperty()
  originalFilename: string;

  @ApiProperty()
  translatedFilename: string;
}

export class TranslateBookDoneDto {
  @ApiProperty({ example: true })
  done: true;

  @ApiProperty({ example: 100 })
  progress: number;

  @ApiProperty()
  originalFilename: string;

  @ApiProperty()
  translatedFilename: string;
}
