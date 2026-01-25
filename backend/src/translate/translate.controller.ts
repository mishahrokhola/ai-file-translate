import { Controller, Sse, Query } from '@nestjs/common';
import { map } from 'rxjs';
import * as fs from 'fs';

import { GeminiService } from '../ai/gemini.service';

import {
  getTranslatedFilename,
  translatedPath,
  uploadsPath,
} from 'src/files/files.utils';

const MAX_CHUNK_SIZE = 15000;

@Controller('translate')
export class TranslateController {
  constructor(private readonly geminiService: GeminiService) {}

  @Sse('stream')
  streamTranslation(@Query('filename') filename: string) {
    const translatedName = getTranslatedFilename(filename);

    const filePath = uploadsPath(filename);
    const outPath = translatedPath(translatedName);

    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }

    const rawText = fs.readFileSync(filePath, 'utf-8');
    const chunks = this.splitTextIntoBigChunks(rawText);

    return this.geminiService.translateLargeBook(chunks).pipe(
      map(({ translation, progress }) => {
        fs.appendFileSync(outPath, translation + '\n\n');

        return { data: { progress, newFilename: translatedName } };
      }),
    );
  }

  /**
   * Розбиває текст на великі частини, намагаючись не розривати абзаци.
   * @param text Повний текст файлу
   * @param maxChars Максимальна кількість символів у чанку (напр. 10000)
   */
  splitTextIntoBigChunks(text: string): string[] {
    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      let chunkEnd = currentIndex + MAX_CHUNK_SIZE;

      if (chunkEnd < text.length) {
        const lastNewline = text.lastIndexOf('\n\n', chunkEnd);

        if (lastNewline > currentIndex + 500) {
          chunkEnd = lastNewline;
        }
      }

      chunks.push(text.substring(currentIndex, chunkEnd).trim());
      currentIndex = chunkEnd;
    }
    return chunks;
  }
}
