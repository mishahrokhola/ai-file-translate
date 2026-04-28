import { Controller, Sse, Query } from '@nestjs/common';
import { map, Observable, of, concat, tap } from 'rxjs';
import * as fs from 'fs';

import { GeminiService } from '../ai/gemini.service';

import { TranslateQueryDto } from 'src/dto/translate-query.dto';
import { cleanMarkedTags, splitTextIntoBigChunks } from 'src/utils/text.utils';
import { getTranslatedFilename, getMarkedTranslatedFilename, translatedPath, uploadsPath } from 'src/files/files.utils';

export type TranslateBookData = {
  result: Result<object, { errorMessage: string }>;
  progress: number;
  chunkIndex: number;

  filename: string;
  translatedFilename: string;
};

export type TranslateBookDone = {
  done: true;
  progress: number;

  filename: string;
  translatedFilename: string;
};

export type TranslateBookContext = {
  context: string;
  lastChunk: number;
};

@Controller('translate')
export class TranslateController {
  constructor(private readonly geminiService: GeminiService) {}

  @Sse('stream')
  streamTranslation(@Query() query: TranslateQueryDto): Observable<{ data: TranslateBookData | TranslateBookDone }> {
    const { filename, startFrom: _startFrom } = query;
    const translatedName = getTranslatedFilename(filename);
    const markedTranslatedName = getMarkedTranslatedFilename(filename);

    const filePath = uploadsPath(filename);
    const outPath = translatedPath(translatedName);
    const contextPath = outPath + '.context.json';
    const markedOutPath = translatedPath(markedTranslatedName);

    const startFrom = fs.existsSync(contextPath) && _startFrom ? _startFrom : 0;

    if (startFrom === 0) {
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
      if (fs.existsSync(contextPath)) fs.unlinkSync(contextPath);
      if (fs.existsSync(markedOutPath)) fs.unlinkSync(markedOutPath);
    }

    const rawText = fs.readFileSync(filePath, 'utf-8');
    const allChunks = splitTextIntoBigChunks(rawText);
    const chunks = allChunks.slice(startFrom);

    const doneMessage$ = of({
      data: { done: true, progress: 100, filename, translatedFilename: translatedName } satisfies TranslateBookDone,
    });

    if (chunks.length === 0) {
      return doneMessage$;
    }

    console.log(`[Translate ${filename}] Started translating ${allChunks.length} chunks`);
    const initialContext = this.getInitialContext(filename, startFrom, contextPath);
    const translationStream$ = this.geminiService.translateLargeBook(chunks, initialContext).pipe(
      tap(({ chunkIndex }) => console.log(`[Translate ${filename}] Processing chunk ${startFrom + chunkIndex + 1} of ${allChunks.length}`)),
      map(({ result: _result, chunkIndex: slicedIndex }) => {
        const chunkIndex = startFrom + slicedIndex;
        const progress = Math.round(((chunkIndex + 1) / allChunks.length) * 100);

        const [data, error] = _result;
        const common = { chunkIndex, progress, filename, translatedFilename: translatedName };

        if (error) {
          return { data: { ...common, result: [null, error] } satisfies TranslateBookData };
        }

        fs.appendFileSync(outPath, cleanMarkedTags(_result[0].translation) + '\n\n');
        fs.appendFileSync(markedOutPath, _result[0].translation + '\n\n');

        fs.writeFileSync(contextPath, JSON.stringify({ context: data.updatedContext, lastChunk: chunkIndex }));

        return { data: { ...common, result: [{}, null] } satisfies TranslateBookData };
      }),
    );

    return concat(translationStream$, doneMessage$);
  }

  private getInitialContext(filename: string, startFrom: number, contextPath: string): string | undefined {
    if (startFrom > 0 && fs.existsSync(contextPath)) {
      try {
        const savedData = JSON.parse(fs.readFileSync(contextPath, 'utf-8')) as TranslateBookContext;
        console.log(`[Translate ${filename}] Restored context from chunk ${startFrom}`);
        return savedData.context;
      } catch (e) {
        console.error(`[Translate ${filename}] Failed to read context file`, e);
      }
    }
  }
}
