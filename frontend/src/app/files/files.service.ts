import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FilesService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/files';

  upload(file: File): Observable<{ filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filename: string }>(`${this.baseUrl}/upload`, formData);
  }

  download(filename: string): void {
    window.open(`${this.baseUrl}/download/${filename}`, '_blank');
  }
}
