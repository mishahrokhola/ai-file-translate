import { Injectable, signal, effect, computed } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal(this.getStoredTheme() || this.getSystemPreference());
  public readonly theme = this._theme.asReadonly();

  public readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    effect(() => {
      localStorage.setItem('user-theme', this._theme());
      document.documentElement.classList.toggle('dark', this._theme() === 'dark');
    });
  }

  toggle() {
    this._theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  private getStoredTheme(): Theme | null {
    return localStorage.getItem('user-theme') as Theme | null;
  }

  private getSystemPreference(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
