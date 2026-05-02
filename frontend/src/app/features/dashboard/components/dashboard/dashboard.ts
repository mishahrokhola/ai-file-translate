import { Component, output, signal } from '@angular/core';
import { DashboardHeader } from '../dashboard-header/dashboard-header';
import { Tabs } from '@shared/tabs';
import { BookList } from '@features/books';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.html',
  imports: [DashboardHeader, Tabs, BookList],
})
export class Dashboard {
  goToUpload = output<void>();
  currentTab = signal<'books' | 'models'>('books');
}
