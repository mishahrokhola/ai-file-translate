import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, existsSync } from 'fs';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { translatedPath, uploadsPath } from './files.utils';

const storage = diskStorage({
  destination: uploadsPath(),
  filename: (req, file, cb) => cb(null, file.originalname),
});

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не було завантажено');
    }

    return { filename: file.filename };
  }

  @Get('download/:filename')
  downloadFile(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const filePath = translatedPath(filename);

    if (!existsSync(filePath)) {
      throw new BadRequestException('Файл ще не готовий або не існує');
    }

    const fileStream = createReadStream(filePath);

    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(fileStream);
  }
}
