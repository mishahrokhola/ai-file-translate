import { Component, model } from '@angular/core';

@Component({
  selector: 'tabs',
  templateUrl: './tabs.html',
})
export class Tabs {
  activeTab = model<'books' | 'models'>('books');
}
