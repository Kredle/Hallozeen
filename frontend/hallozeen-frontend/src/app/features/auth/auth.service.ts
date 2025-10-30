import { inject, Injectable } from '@angular/core';
import { HallozeenApiClient, LoginRequestDTO } from '../../api/hallozeen-api-client';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'jwt-token';
  apiClient: HallozeenApiClient = inject(HallozeenApiClient);

  login(email: string, password: string) {
    const body = new LoginRequestDTO({ email, password });
    return this.apiClient.login(body).pipe(
      tap((response: any) => {
        const token = response?.token ?? response;
        if (token) localStorage.setItem(this.tokenKey, token);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
