import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHotToastConfig } from '@ngxpert/hot-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideRouter(routes),
    provideHttpClient(),
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideHotToastConfig({ position: 'bottom-left', className: 'mi-toast' }),
  ],
};
