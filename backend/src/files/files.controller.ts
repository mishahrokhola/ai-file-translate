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
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import type { Response } from 'express';

import { User } from '../decorators/user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { FileInfoDto } from './file-info.dto';
import { FileDownloadQueryDto } from './file.query.dto';

import { getFilenameByVariant, userBookFolderPath } from './files.utils';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const path = userBookFolderPath(req.user?.id ?? 1, file.originalname);

    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    cb(null, path);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Завантажити файл для перекладу' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'Файл успішно завантажено', type: FileInfoDto })
  @UseInterceptors(FileInterceptor('file', { storage }))
  upload(@UploadedFile() file: Express.Multer.File): FileInfoDto {
    if (!file) {
      throw new BadRequestException('Файл не було завантажено');
    }

    return { filename: file.filename, size: file.size, createdAt: new Date().toISOString() };
  }

  @Get('download/:filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Скачати файл' })
  @ApiResponse({
    status: 200,
    description: 'Файл успішно отримано',
    content: { 'text/plain': { schema: { type: 'string', format: 'binary' } } },
  })
  download(
    @User('id') userId: number,
    @Query() query: FileDownloadQueryDto,
    @Param('filename') originalFilename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { variant } = query;
    const filename = getFilenameByVariant(originalFilename, variant);
    const filePath = userBookFolderPath(userId, originalFilename, filename);

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
