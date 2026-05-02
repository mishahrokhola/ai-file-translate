import { Component, inject, model, output, signal } from '@angular/core';
import { Schemas, TranslateService } from '@core';
import { DatePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { BooksService } from '@features';

@Component({
  selector: 'book-list-item',
  templateUrl: './book-list-item.html',
  imports: [DatePipe],
  host: {
    class:
      'relative flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all',

    '(document:click)': 'isMenuOpen.set(false)',
  },
})
export class BookListItem {
  private readonly booksService = inject(BooksService);
  private readonly translateService = inject(TranslateService);

  book = model.required<Schemas['BookDto']>();

  delete = output<void>();
  download = output<'original' | 'translated' | 'marked'>();

  isMenuOpen = signal(false);

  progress = toSignal(toObservable(this.book).pipe(switchMap((book) => this.getProgress(book))), {
    initialValue: 0,
  });

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen.update((v) => !v);
  }

  getDisplayName(name: string): string {
    return name.split('.').slice(0, -1).join('.') || name;
  }

  private getProgress(book: Schemas['BookDto']): Observable<number> {
    if (book.status === 'uploaded' || book.status === 'translating') {
      return this.translateService.trackProgress(book.name).pipe(
        map((event) => event.progress),
        switchMap((progress) => {
          if (progress !== 100) {
            return of(progress);
          }

          return this.booksService.item(book.name).pipe(
            tap((book) => this.book.set(book)),
            map((book) => book.progress),
          );
        }),
        startWith(book.progress),
      );
    }

    return of(book.progress);
  }
}
