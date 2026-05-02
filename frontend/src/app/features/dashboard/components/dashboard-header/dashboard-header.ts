import { Component, inject } from '@angular/core';
import { ThemeService } from '@core/theme';

@Component({
  selector: 'dashboard-header',
  templateUrl: './dashboard-header.html',
})
export class DashboardHeader {
  theme = inject(ThemeService);
}
