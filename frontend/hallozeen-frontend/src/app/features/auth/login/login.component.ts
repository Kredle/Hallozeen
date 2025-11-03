import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { appConfig } from '../../../app.config';
import { ApiException } from '../../../api/hallozeen-api-client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  isSubmitted = signal(false);
  loginFailed = signal(false);
  isLoading = signal(false);
  errorMessages = signal<string[]>([]);

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(form: NgForm) {
    if (form.invalid) return;

    this.isLoading.set(true);
    this.loginFailed.set(false);
    this.errorMessages.set([]);

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSubmitted.set(true);
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.isLoading.set(false);
        this.loginFailed.set(true);
        this.isSubmitted.set(false);
        this.errorMessages.set(this.extractApiErrors(err));
      },
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  onPopupClose() {
    this.isSubmitted.set(false);
    this.router.navigate(['/login/success']);
  }

  onAdClick() {
    window.location.href = '/ad';
  }
  private extractApiErrors(err: unknown): string[] {
    const msgs: string[] = [];
    if (ApiException.isApiException(err as any)) {
      const apiErr = err as ApiException;
      const raw = apiErr.response?.toString() ?? '';
      const parsed = this.tryParseJson(raw);
      if (parsed != null) this.collectFromParsed(parsed, msgs);
      if (msgs.length === 0 && raw) msgs.push(raw);
    } else if (err && typeof err === 'object' && 'message' in (err as any)) {
      msgs.push(String((err as any).message));
    }
    if (msgs.length === 0) msgs.push('Login failed. Please check your credentials.');
    return Array.from(new Set(msgs.map(s => s.trim()).filter(Boolean)));
  }

  private tryParseJson(text: string): any | null {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }

  private collectFromParsed(parsed: any, out: string[]) {
    if (!parsed) return;
    if (Array.isArray(parsed)) {
      for (const item of parsed) if (typeof item === 'string') out.push(item);
      return;
    }
    if (typeof parsed === 'string') {
      out.push(parsed);
      return;
    }
    const candidates = [parsed?.message, parsed?.error, parsed?.title, parsed?.detail];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) out.push(c);
      if (Array.isArray(c)) out.push(...(c as string[]));
    }
    if (parsed?.errors && typeof parsed.errors === 'object') {
      for (const key of Object.keys(parsed.errors)) {
        const val = (parsed.errors as any)[key];
        if (Array.isArray(val)) out.push(...val.map((v: any) => String(v)));
        else if (typeof val === 'string') out.push(val);
      }
    }
  }
}
