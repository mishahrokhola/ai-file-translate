import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly baseUrl = 'http://localhost:3000/translate';

  trackProgress(filename: string): Observable<{ progress: number; newFilename: string }> {
    return new Observable((subscriber) => {
      const eventSource = new EventSource(`${this.baseUrl}/stream?filename=${filename}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        subscriber.next(data);

        if (data.progress === 100) {
          eventSource.close();
          subscriber.complete();
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
}
