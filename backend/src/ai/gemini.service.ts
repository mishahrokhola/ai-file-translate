import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { concatMap, delay, from, map, Observable } from 'rxjs';

@Injectable()
export class GeminiService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  private model = this.genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    systemInstruction: `You are a professional book translator. 
    Your goal is to maintain 100% consistency in character genders, names, and terminology.
    When you receive 'CONTEXT STORE', use it as the absolute truth for names and gender.`,
  });

  translateLargeBook(chunks: string[]): Observable<{
    translation: string;
    updatedContext: string;
    progress: number;
  }> {
    let contextStore = 'Initial start. No characters known yet.';
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
              translation,
              updatedContext,
              progress: Math.round(((index + 1) / total) * 100),
            };
          }),
        ),
      ),
    );
  }
}
