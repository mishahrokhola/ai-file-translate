import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';

import { FilesService } from './files/files.service';
import { ThemeService } from './theme/theme.service';
import { TranslateService } from './translate/translate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  public themeService = inject(ThemeService);
  private filesService = inject(FilesService);
  private translateService = inject(TranslateService);

  progress = signal(0);
  isTranslating = signal(false);
  readyFile = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  download() {
    const filename = this.readyFile();
    filename && this.filesService.download(filename);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.isTranslating.set(true);
    this.readyFile.set(null);

    this.filesService.upload(file).subscribe({
      next: (res) => this.startStreaming(res.filename),
      error: () => this.isTranslating.set(false),
    });
  }

  private startStreaming(filename: string) {
    this.translateService.trackProgress(filename).subscribe({
      next: (data) => {
        this.progress.set(data.progress);

        if (data.progress === 100) {
          this.readyFile.set(data.newFilename);
          this.isTranslating.set(false);
          this.fileInput().nativeElement.value = '';
        }
      },
      error: (err) => {
        console.error('SSE Error:', err);
        this.errorMessage.set(err);
        this.resetProcess();
      },
    });
  }

  private resetProcess() {
    this.progress.set(0);
    this.readyFile.set(null);
    this.isTranslating.set(false);

    this.fileInput().nativeElement.value = '';
  }
}
