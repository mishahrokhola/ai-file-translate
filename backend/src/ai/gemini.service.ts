import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { concatMap, delay, from, map, Observable, catchError, of } from 'rxjs';

import { getErrorMessage } from 'src/utils/error.utils';

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

  translateLargeBook(
    chunks: string[],
    initialContext?: string | null,
  ): Observable<{ result: TranslateBookResult; chunkIndex: number; progress: number }> {
    let contextStore = initialContext || 'Initial start. No characters known yet.';
    const total = chunks.length;

    return from(chunks).pipe(
      concatMap((chunk, index) =>
        from(
          this.model.generateContent({
            contents: [
              {
                role: 'user',

                parts: [
                  {
                    text: `
                      CONTEXT STORE: ${contextStore}
                      
                      TASK: Translate to Ukrainian and update Context Store (characters, gender, key events).
                      FORMAT: [T]...translation...[C]...updated store...

                      TEXT: ${chunk}`,
                  },
                ],
              },
            ],
            generationConfig: { maxOutputTokens: 8192, temperature: 0.2 },
          }),
        ).pipe(
          delay(1500),
          map((result) => {
            const response = result.response.text();
            const parts = response.split('[C]');

            const translation = parts[0].replace('[T]', '').trim();
            const updatedContext = parts[1]?.trim() || contextStore;

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
}
