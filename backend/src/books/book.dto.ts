import { ApiProperty } from '@nestjs/swagger';
import { FileInfoDto } from '../files/file-info.dto';

export class BookDto {
  @ApiProperty({ description: 'Статус файлу', enum: ['uploaded', 'translating', 'translated', 'error'] })
  status!: 'uploaded' | 'translating' | 'translated' | 'error';

  @ApiProperty({ description: 'Прогрес перекладу' })
  progress!: number;

  @ApiProperty({ description: 'Назва завантаженого файлу' })
  name!: string;

  @ApiProperty({ description: 'Інформація завантаженого файлу', type: FileInfoDto })
  originalFile!: FileInfoDto;

  @ApiProperty({ description: 'Інформація перекладеного файлу', type: FileInfoDto, required: false })
  translatedFile: FileInfoDto | null;

  @ApiProperty({ description: 'Інформація тегованого файлу', type: FileInfoDto, required: false })
  markedFile: FileInfoDto | null;
}
