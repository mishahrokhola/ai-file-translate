import { basename } from 'node:path';
import { statSync, existsSync, unlinkSync, readFileSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { FileInfoDto } from './file-info.dto';
import { TranslateBookMeta } from '../types/translate.types';
import { userBookFolderPath } from './files.utils';

@Injectable()
export class FilesService {
  public getInfo(filePath: string): FileInfoDto | null {
    if (!existsSync(filePath)) {
      return null;
    }

    const stats = statSync(filePath);

    return { filename: basename(filePath), size: stats.size, createdAt: stats.mtime.toISOString() };
  }

  public delete(filePath: string | string[]): void {
    const arr = Array.isArray(filePath) ? filePath : [filePath];
    arr.forEach((path) => existsSync(path) && unlinkSync(path));
  }

  public getMeta(userId: number, filename: string): Result<TranslateBookMeta | null, Error> {
    const metaPath = userBookFolderPath(userId, filename, 'meta.json');

    if (!existsSync(metaPath)) {
      return [null, null];
    }

    try {
      const data = JSON.parse(readFileSync(metaPath, 'utf-8')) as TranslateBookMeta;

      return [data, null];
    } catch (e) {
      return [null, e];
    }
  }
}
