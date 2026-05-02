import { Component, computed, inject, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FilesService } from '@core/files';
import { BooksService } from '../../services/books.service';
import { BookListItem } from '../book-list-item/book-list-item';

@Component({
  selector: 'book-list',
  imports: [BookListItem],
  templateUrl: './book-list.html',
})
export class BookList {
  goToUpload = output<void>();

  private filesService = inject(FilesService);
  private booksService = inject(BooksService);

  private booksRes = rxResource({
    stream: () => this.booksService.list(),
    defaultValue: [],
  });

  books = computed(() => this.booksRes.value());
  isLoading = computed(() => this.booksRes.isLoading());

  onDownload(originalFilename: string, variant: 'original' | 'translated' | 'marked'): void {
    this.filesService.download(originalFilename, variant);
  }
}
