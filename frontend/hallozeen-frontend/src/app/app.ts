import { HttpClientModule } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from './api/environments/environment';
import { HallozeenApiClient } from './api/hallozeen-api-client';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule],
  providers: [{ provide: 'API_BASE_URL', useValue: environment.apiUrl }, HallozeenApiClient],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('hallozeen-frontend');
}
