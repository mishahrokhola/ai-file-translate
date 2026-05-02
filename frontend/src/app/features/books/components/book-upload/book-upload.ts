import { Component, computed, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';

import { FilesService } from '@core/files';
import { ThemeService } from '@core/theme';
import { HotToastService } from '@ngxpert/hot-toast';
import { TranslateBookErrorData, TranslateService } from '@core/translate';
import { DragDropHandler } from '@core/upload';

type UploadState = 'IDLE' | 'UPLOADING' | 'TRANSLATING' | 'COMPLETED' | 'ERROR';

@Component({
  selector: 'book-upload',
  templateUrl: './book-upload.html',
  imports: [DragDropHandler, DecimalPipe],
})
export class BookUpload {
  goBack = output<void>();

  themeService = inject(ThemeService);
  private toast = inject(HotToastService);
  private filesService = inject(FilesService);
  private translateService = inject(TranslateService);

  state = signal<UploadState>('IDLE');
  progress = signal(0);
  readyFile = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  errorData = signal<TranslateBookErrorData | null>(null);

  isDarkMode = computed(() => this.themeService.theme() === 'dark');

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private allowedFileTypes = computed(
    () => this.fileInput()?.nativeElement?.accept?.split(',') ?? [],
  );

  onDrop(event: DragEvent) {
    const file = event.dataTransfer?.files?.[0];

    if (file && !this.isValidFileType(file, this.allowedFileTypes())) {
      const ext = file.name.split('.').pop();
      this.toast.error(`Файли формату ".${ext}" не підтримуються.`);
      return;
    }

    if (file && this.isValidFileType(file, this.allowedFileTypes())) {
      this.handleFile(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    file && this.handleFile(file);
  }

  downloadFile() {
    const filename = this.readyFile();
    filename && this.filesService.download(filename, 'translated');
  }

  restore(errorData: TranslateBookErrorData, chunkIndex: number) {
    this.startStreaming(errorData.originalFilename, chunkIndex);
  }

  startNewFile(): void {
    this.state.set('IDLE');
    this.resetProcess();
  }

  triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }

  private resetProcess() {
    this.progress.set(0);
    this.readyFile.set(null);
    const el = this.fileInput()?.nativeElement;
    if (el) el.value = '';
  }

  private handleFile(file: File): void {
    if (this.state() === 'UPLOADING' || this.state() === 'TRANSLATING') return;

    this.readyFile.set(null);
    this.state.set('UPLOADING');

    this.filesService.upload(file).subscribe({
      next: (res) => this.startStreaming(res.filename),
      error: (error) => {
        this.errorMessage.set('');
        this.state.set('ERROR');

        if (error instanceof HttpErrorResponse && error.status === 0) {
          this.errorMessage.set(
            "Сервер недоступний або немає з'єднання. Перегрузіть сторінку або спробуйте пізніше.",
          );
        }
      },
    });
  }

  private startStreaming(filename: string, startFrom = 0) {
    this.state.set('TRANSLATING');
    this.errorData.set(null);

    this.translateService.trackProgress(filename, startFrom).subscribe({
      next: (data) => {
        this.progress.set(data.progress);

        if (data.progress === 100) {
          this.readyFile.set(data.originalFilename);
          this.state.set('COMPLETED');
          const el = this.fileInput()?.nativeElement;
          if (el) el.value = '';
        }
      },
      error: (err) => {
        console.error('SSE Error:', err);

        const message = this.translateService.isErrorData(err) ? err.result.errorMessage : err;

        this.state.set('ERROR');
        this.errorMessage.set(message);
        this.errorData.set(this.translateService.isErrorData(err) ? err : null);

        this.resetProcess();
      },
    });
  }

  private isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });
  }
}
