import { Injectable } from '@nestjs/common';
import { map, Observable, of, concat, tap, shareReplay, finalize } from 'rxjs';
import * as fs from 'fs';

import { FilesService } from '../files/files.service';
import { GeminiService } from '../ai/gemini.service';

import { TranslateBookMeta } from '../types/translate.types';
import { TranslateQueryDto } from 'src/translate/translate.query.dto';
import { TranslateBookDataDto, TranslateBookDoneDto } from './translate-book.dto';

import { cleanMarkedTags, splitTextIntoBigChunks } from 'src/utils/text.utils';
import { getTranslatedFilename, getMarkedFilename, userBookFolderPath } from 'src/files/files.utils';

@Injectable()
export class TranslateService {
  private activeStreams = new Map<string, Observable<{ data: TranslateBookDataDto | TranslateBookDoneDto }>>();

  constructor(
    private readonly filesService: FilesService,
    private readonly geminiService: GeminiService,
  ) {}

  getStream(userId: number, query: TranslateQueryDto): Observable<{ data: TranslateBookDataDto | TranslateBookDoneDto }> {
    const { filename: originalFilename, startFrom: _startFrom } = query;

    const key = `${userId}-${query.filename}`;
    const existingStream = this.activeStreams.get(key);

    if (existingStream) {
      console.log(`[Translate ${originalFilename}] rejoin stream`);
      return existingStream;
    }

    const translatedFilename = getTranslatedFilename(originalFilename);
    const markedTranslatedName = getMarkedFilename(originalFilename);

    const filePath = userBookFolderPath(userId, originalFilename, originalFilename);
    const outPath = userBookFolderPath(userId, originalFilename, translatedFilename);
    const metaPath = userBookFolderPath(userId, originalFilename, 'meta.json');
    const markedOutPath = userBookFolderPath(userId, originalFilename, markedTranslatedName);

    const startFrom = fs.existsSync(metaPath) && _startFrom ? _startFrom : 0;

    if (startFrom === 0) {
      this.filesService.delete([outPath, metaPath, markedOutPath]);
    }

    const rawText = fs.readFileSync(filePath, 'utf-8');
    const allChunks = splitTextIntoBigChunks(rawText);
    const chunks = allChunks.slice(startFrom);

    const doneMessage$ = of({
      data: { done: true, progress: 100, originalFilename, translatedFilename: translatedFilename } satisfies TranslateBookDoneDto,
    });

    if (chunks.length === 0) {
      return doneMessage$;
    }

    console.log(`[Translate ${originalFilename}] Started translating ${allChunks.length} chunks`);
    const initialContext = this.getInitialContext(userId, originalFilename, startFrom);
    const translationStream$ = this.geminiService.translateLargeBook(chunks, initialContext).pipe(
      tap(({ chunkIndex }) =>
        console.log(`[Translate ${originalFilename}] Processing chunk ${startFrom + chunkIndex + 1} of ${allChunks.length}`),
      ),
      map(({ result: _result, chunkIndex: slicedIndex }) => {
        const chunkIndex = startFrom + slicedIndex;
        const progress = Math.round(((chunkIndex + 1) / allChunks.length) * 100);

        const [data, error] = _result;
        const common = { chunkIndex, progress, originalFilename, translatedFilename: translatedFilename };

        if (error) {
          return { data: { ...common, result: { status: 'error', errorMessage: error.errorMessage } } satisfies TranslateBookDataDto };
        }

        fs.appendFileSync(outPath, cleanMarkedTags(_result[0].translation) + '\n\n');
        fs.appendFileSync(markedOutPath, _result[0].translation + '\n\n');

        const meta: TranslateBookMeta = { context: data.updatedContext, progress, chunkCount: allChunks.length, lastChunk: chunkIndex };
        fs.writeFileSync(metaPath, JSON.stringify(meta));

        return { data: { ...common, result: { status: 'success' } } satisfies TranslateBookDataDto };
      }),
    );

    const stream$ = concat(translationStream$, doneMessage$).pipe(
      finalize(() => this.activeStreams.delete(key)),
      shareReplay(1),
    );

    // background process
    stream$.subscribe();

    this.activeStreams.set(key, stream$);

    return stream$;
  }

  private getInitialContext(userId: number, originalFilename: string, startFrom: number): string | null {
    if (startFrom <= 0) {
      return null;
    }

    const [savedData, error] = this.filesService.getMeta(userId, originalFilename);

    if (!savedData || error) {
      console.error(`[Translate ${originalFilename}] Failed to read meta file`, error);
      return null;
    }

    console.log(`[Translate ${originalFilename}] Restored context from chunk ${startFrom}`);
    return savedData.context;
  }
}
