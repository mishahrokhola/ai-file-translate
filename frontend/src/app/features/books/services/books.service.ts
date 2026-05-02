import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schemas } from '@core/api';

@Injectable({ providedIn: 'root' })
export class BooksService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/books';

  list(): Observable<Schemas['BookDto'][]> {
    return this.http.get<Schemas['BookDto'][]>(`${this.baseUrl}`);
  }

  item(filename: string): Observable<Schemas['BookDto']> {
    return this.http.get<Schemas['BookDto']>(`${this.baseUrl}/${filename}`);
  }

  delete(filename: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${filename}`);
  }
}
