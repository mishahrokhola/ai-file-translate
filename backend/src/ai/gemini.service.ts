import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { concatMap, delay, from, map, Observable, catchError, of } from 'rxjs';

import { GoogleTranslateService } from './google-translate.service';

import { getErrorMessage } from 'src/utils/error.utils';
import { splitTextIntoBigChunks } from 'src/utils/text.utils';

export type TranslateBookResult = Result<{ translation: string; updatedContext: string }, { errorMessage: string }>;

@Injectable()
export class GeminiService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  private model = this.genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
    systemInstruction: `You are a professional book translator. 
    Your goal is to maintain 100% consistency in character genders, names, and terminology.
    When you receive 'CONTEXT STORE', use it as the absolute truth for names and gender.`,
  });

  constructor(private readonly googleTranslateService: GoogleTranslateService) {}

  translateLargeBook(
    chunks: string[],
    initialContext?: string | null,
  ): Observable<{ result: TranslateBookResult; chunkIndex: number; progress: number }> {
    let contextStore = initialContext || 'Initial start. No characters known yet.';
    const total = chunks.length;

    return from(chunks).pipe(
      concatMap((chunk, index) =>
        from(this.handleSafetyAndTranslate(chunk, contextStore)).pipe(
          delay(1500),
          map(({ translation, updatedContext }) => {
            contextStore = updatedContext;

            return {
              chunkIndex: index,
              result: [{ translation, updatedContext }, null] satisfies TranslateBookResult,
              progress: Math.round(((index + 1) / total) * 100),
            };
          }),
          catchError((err: unknown) => {
            console.error(`Error in chunk ${index + 1}:`, err);

            const errorMessage = `Помилка у фрагменті ${index + 1}: ${getErrorMessage(err)}`;

            return of({
              chunkIndex: index,
              result: [null, { errorMessage }] satisfies TranslateBookResult,
              progress: Math.round(((index + 1) / total) * 100),
            });
          }),
        ),
      ),
    );
  }

  private async handleSafetyAndTranslate(chunk: string, context: string): Promise<{ translation: string; updatedContext: string }> {
    try {
      return await this.translate(chunk, context);
    } catch (err: unknown) {
      if (!this.isSafetyBlock(err)) {
        throw err;
      }

      console.warn(`[Safety] Chunk was blocked. Splitting into smaller pieces and retrying...`);

      // Спроба 2: Дробимо на менші шматочки (наприклад, по 4000 символів)
      const subChunks = splitTextIntoBigChunks(chunk, 4000);

      let fullTranslation = '';
      let currentContext = context;

      for (const sub of subChunks) {
        try {
          const res = await this.translate(sub, currentContext);
          fullTranslation += res.translation + '\n\n';
          currentContext = res.updatedContext;
        } catch {
          console.error(`[Safety Fallback] Sub-chunk blocked again. Using Google Translate.`);

          const googleRes = await this.googleTranslateService.translate(sub);
          fullTranslation += googleRes + '\n\n';
        }
      }

      return { translation: fullTranslation.trim(), updatedContext: currentContext };
    }
  }

  private async translate(text: string, context: string): Promise<{ translation: string; updatedContext: string }> {
    const promt = `
      CONTEXT STORE: ${context}
                      
      TASK: Translate to Ukrainian and update Context Store (characters, gender, key events).
      FORMAT: [T]...translation...[C]...updated store...

      TEXT: ${text}
    `;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promt }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.2 },
    });

    const response = result.response.text();
    const parts = response.split('[C]');

    const translation = parts[0].replace('[T]', '').trim();
    const updatedContext = parts[1]?.trim() || context;

    return { translation, updatedContext };
  }

  private isSafetyBlock(err: unknown): err is { message: string } {
    return !!err && typeof err === 'object' && 'message' in err && typeof err.message === 'string';
  }
}
