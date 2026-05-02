import { Injectable } from '@nestjs/common';
import { readdirSync, rmSync } from 'fs';

import { BookDto } from './book.dto';

import { FilesService } from '../files/files.service';
import { TranslateService } from '../translate/translate.service';

import { userBooksPath, userBookFolderPath, getTranslatedFilename, getMarkedFilename } from '../files/files.utils';

@Injectable()
export class BooksService {
  constructor(
    private readonly filesService: FilesService,
    private readonly translateService: TranslateService,
  ) {}

  public getList(userId: number): BookDto[] {
    return readdirSync(userBooksPath(userId), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => this.getItem(userId, dirent.name))
      .sort((a, b) => new Date(b.originalFile.createdAt).getTime() - new Date(a.originalFile.createdAt).getTime());
  }

  public getItem(userId: number, originalFilename: string): BookDto {
    const originalFile = this.filesService.getInfo(userBookFolderPath(userId, originalFilename, originalFilename))!;
    const translatedFile = this.filesService.getInfo(userBookFolderPath(userId, originalFilename, getTranslatedFilename(originalFilename)));
    const markedFile = this.filesService.getInfo(userBookFolderPath(userId, originalFilename, getMarkedFilename(originalFilename)));
    const [meta, error] = this.filesService.getMeta(userId, originalFilename);

    if (!meta || error || !translatedFile || !markedFile) {
      return { name: originalFilename, status: 'uploaded', progress: 0, originalFile, translatedFile, markedFile };
    }

    const status = meta.progress === 100 ? 'translated' : 'translating';

    return { name: originalFilename, status, progress: meta.progress, originalFile, translatedFile, markedFile };
  }

  public deleteItem(userId: number, filename: string): void {
    const path = userBookFolderPath(userId, filename);

    try {
      rmSync(path, { recursive: true, force: true });
      this.translateService.stopStream(userId, filename);

      console.log(`Folder "${path}" has been deleted.`);
    } catch (error) {
      console.error(`Error while deleting the folder "${path}": ${error}`);
    }
  }
}
