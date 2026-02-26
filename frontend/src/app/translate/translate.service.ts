import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type TranslateBookData = {
  result: TranslateBookResult;
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

export type TranslateBookErrorData = {
  result: [null, { errorMessage: string }];
  progress: number;
  chunkIndex: number | null; // null on out of bounce

  filename: string;
  translatedFilename: string;
};

export type TranslateBookResult = Result<{}, { errorMessage: string }>;

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly baseUrl = 'http://localhost:3000/translate';

  trackProgress(filename: string, startFrom = 0): Observable<TranslateBookData> {
    return new Observable((subscriber) => {
      const eventSource = new EventSource(
        `${this.baseUrl}/stream?filename=${filename}&startFrom=${startFrom}`,
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data) as TranslateBookData | TranslateBookDone;

        if ('done' in data) {
          eventSource.close();
          subscriber.complete();
          return;
        }

        const [, error] = data.result;

        subscriber.next(data);

        if (data.progress === 100) {
          eventSource.close();
          subscriber.complete();
        }

        if (error) {
          eventSource.close();
          subscriber.error(data);
        }
      };

      eventSource.onerror = (error) => {
        if (error instanceof MessageEvent) {
          subscriber.error(error.data);
        } else {
          subscriber.error(error);
        }

        eventSource.close();
      };

      return () => eventSource.close();
    });
  }

  isErrorData(error: unknown): error is TranslateBookErrorData {
    return !!error && typeof error === 'object' && 'result' in error;
  }
}
