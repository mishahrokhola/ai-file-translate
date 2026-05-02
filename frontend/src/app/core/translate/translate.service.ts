import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Schemas } from '@core/api';

type TranslateBookEvent = Schemas['TranslateBookDataDto'] | Schemas['TranslateBookDoneDto'];
export type TranslateBookErrorData = Schemas['TranslateBookDataDto'] & {
  result: Schemas['ErrorResultDto'];
};

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly baseUrl = 'http://localhost:3000/translate';

  trackProgress(filename: string, startFrom = 0): Observable<TranslateBookEvent> {
    return new Observable((subscriber) => {
      const eventSource = new EventSource(
        `${this.baseUrl}/stream?filename=${filename}&startFrom=${startFrom}`,
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data) as TranslateBookEvent;

        if ('done' in data) {
          eventSource.close();
          subscriber.complete();
          return;
        }

        subscriber.next(data);

        if (data.progress === 100) {
          eventSource.close();
          subscriber.complete();
        }

        if (data.result.status === 'error') {
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
    if (!error || typeof error !== 'object') return false;

    if (!('result' in error) || !error.result || typeof error.result !== 'object') return false;

    return 'status' in error.result && error.result.status === 'error';
  }
}
