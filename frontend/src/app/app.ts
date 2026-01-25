import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';

import { FilesService } from './files/files.service';
import { ThemeService } from './theme/theme.service';
import { TranslateService } from './translate/translate.service';

import { DragDropHandler } from './upload/drag-drop-handler';

type TranslateState = 'IDLE' | 'UPLOADING' | 'TRANSLATING' | 'COMPLETED' | 'ERROR';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [DragDropHandler],
})
export class App {
  public themeService = inject(ThemeService);
  private filesService = inject(FilesService);
  private translateService = inject(TranslateService);

  state = signal<TranslateState>('IDLE');
  progress = signal(0);
  readyFile = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  isDarkMode = computed(() => this.themeService.theme() === 'dark');

  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  onDrop(event: DragEvent) {
    const file = event.dataTransfer?.files?.[0];
    file && this.handleFile(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    file && this.handleFile(file);
  }

  downloadFile() {
    const filename = this.readyFile();
    filename && this.filesService.download(filename);
  }

  resetProcess() {
    this.progress.set(0);
    this.state.set('IDLE');
    this.readyFile.set(null);

    this.fileInput().nativeElement.value = '';
  }

  triggerFileInput(): void {
    this.fileInput().nativeElement.click();
  }

  private handleFile(file: File): void {
    if (this.state() === 'UPLOADING' || this.state() === 'TRANSLATING') return;

    this.readyFile.set(null);
    this.state.set('UPLOADING');

    this.filesService.upload(file).subscribe({
      next: (res) => this.startStreaming(res.filename),
      error: () => this.state.set('ERROR'),
    });
  }

  private startStreaming(filename: string) {
    this.state.set('TRANSLATING');

    this.translateService.trackProgress(filename).subscribe({
      next: (data) => {
        this.progress.set(data.progress);

        if (data.progress === 100) {
          this.readyFile.set(data.newFilename);
          this.state.set('COMPLETED');
          this.fileInput().nativeElement.value = '';
        }
      },
      error: (err) => {
        console.error('SSE Error:', err);
        this.state.set('ERROR');
        this.errorMessage.set(err);
        this.resetProcess();
      },
    });
  }
}
