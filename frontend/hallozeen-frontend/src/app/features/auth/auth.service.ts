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
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  isTokenExpired(token?: string | null): boolean {
    try {
      const t = token ?? this.getToken();
      if (!t) return true;
      const parts = t.split('.');
      if (parts.length < 2) return true;
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
      const json = atob(padded);
      const payload = JSON.parse(json);
      const exp = Number(payload?.exp);
      if (!exp) return true;
      const now = Math.floor(Date.now() / 1000);
      const skew = 5; // seconds skew
      return now >= (exp - skew);
    } catch {
      return true;
    }
  }
}
