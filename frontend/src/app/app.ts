import { Component, inject, signal, ViewContainerRef } from '@angular/core';
import { Dashboard } from '@features/dashboard';
import { BookUpload } from '@features/books';
import { SvgSprite } from '@shared/icons';

type AppView = 'dashboard' | 'upload';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [Dashboard, BookUpload],
})
export class App {
  view = signal<AppView>('dashboard');

  constructor() {
    inject(ViewContainerRef).createComponent(SvgSprite); // register svg sprite
  }
}
