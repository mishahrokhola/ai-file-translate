import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schemas } from '@core/api';

@Injectable({ providedIn: 'root' })
export class FilesService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/files';

  list(): Observable<Schemas['FileInfoDto'][]> {
    return this.http.get<Schemas['FileInfoDto'][]>(`${this.baseUrl}/list`);
  }

  upload(file: File): Observable<Schemas['FileInfoDto']> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Schemas['FileInfoDto']>(`${this.baseUrl}/upload`, formData);
  }

  download(filename: string, variant: 'original' | 'translated' | 'marked'): void {
    window.open(`${this.baseUrl}/download/${filename}?variant=${variant}`, '_blank');
  }
}
