import { ApiProperty } from '@nestjs/swagger';

export class FileInfoDto {
  @ApiProperty({ description: 'Назва завантаженого файлу' })
  filename!: string;

  @ApiProperty({ description: 'Розмір файлу' })
  size!: number;

  @ApiProperty({ description: 'Дата створення у форматі ISO' })
  createdAt!: string;
}
