import { Component, OnDestroy, signal, NgZone } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HallozeenApiClient, RegisterRequestDTO, ApiException, PasswordCheckDto } from '../../../api/hallozeen-api-client';
import { CaptchaModalComponent } from '../../../shared/captcha/captcha-modal.component';
import { CaptchaService } from '../../../shared/captcha/captcha.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CaptchaModalComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnDestroy {
  name = '';
  email = '';
  password = '';
  passValidation = '';
  passValidation2 = '';

  isSubmitted = signal(false);
  isLoading = signal(false);
  registerFailed = signal(false);
  errorMessages = signal<string[]>([]);
  passwordServerError = signal<string | null>(null);

  private passwordCheckTimer: any;
  private passwordCheckSub?: Subscription;

  get hasAllPasswords(): boolean {
    return !!this.password && !!this.passValidation && !!this.passValidation2;
  }

  get passwordsMatch(): boolean {
    return (
      this.hasAllPasswords &&
      this.password === this.passValidation &&
      this.password === this.passValidation2
    );
  }

  constructor(private api: HallozeenApiClient, public captcha: CaptchaService, private zone: NgZone) {
    // Ensure captcha appears when entering this page
    this.captcha.requireAgain();
  }

  onPasswordChange(next?: string) {
    if (typeof next === 'string') this.password = next;
    // Debounce server check to avoid spamming endpoint
    this.passwordServerError.set(null);
    if (this.passwordCheckTimer) {
      clearTimeout(this.passwordCheckTimer);
    }
    this.passwordCheckTimer = setTimeout(() => this.checkPasswordServerSide(), 350);
  }

  private checkPasswordServerSide() {
    // Skip empty password
    if (!this.password?.trim()) {
      this.passwordServerError.set(null);
      return;
    }
    // Cancel previous in-flight check
    this.passwordCheckSub?.unsubscribe();
    const body = new PasswordCheckDto({ password: this.password });
    this.passwordCheckSub = this.api
      .checkPassword(body)
      .subscribe({
        next: () => {
          this.zone.run(() => this.passwordServerError.set(null));
        },
        error: (err) => {
          const msgs = this.extractApiErrors(err);
          console.error('Password check failed:', err, 'parsed:', msgs);
          this.zone.run(() => this.passwordServerError.set(msgs[0] ?? 'Password does not meet requirements.'));
        }
      });
  }

  onSubmit(form: NgForm) {
    if (!form.valid || !this.passwordsMatch) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.isLoading.set(true);
    this.registerFailed.set(false);
    this.errorMessages.set([]);

    const body = new RegisterRequestDTO({
      username: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
      confirmPassword1: this.passValidation,
      confirmPassword2: this.passValidation2,
    });

    if (this.captcha.required()) return;

    this.api.register(body).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSubmitted.set(true);
      },
      error: (err) => {
        console.error('Register failed:', err);
        this.isLoading.set(false);
        this.registerFailed.set(true);
        this.isSubmitted.set(false);
        this.errorMessages.set(this.extractApiErrors(err));
        this.captcha.reset();
        // Reset form on unsuccessful attempt
        form.resetForm({
          name: '',
          email: '',
          password: '',
          passValidation: '',
          passValidation2: ''
        });
        this.passwordServerError.set(null);
      }
    });
  }

  navigateToLogin() {
    window.location.href = 'login';
  }

  onPopupClose() {
    window.location.href = 'register/success';
    this.isSubmitted.set(false);
  }

  onAdClick() {
    window.location.href = '/ad';
  }

  private extractApiErrors(err: unknown): string[] {
    const msgs: string[] = [];
    if (ApiException.isApiException(err as any)) {
      const apiErr = err as ApiException;
      let raw = apiErr.response?.toString() ?? '';
      // Trim common prefixes like "400 <message>"
      const m = raw.match(/^\s*(\d{3})\s+(.+)$/s);
      if (m) raw = m[2];
      const parsed = this.tryParseJson(raw);
      if (parsed != null) this.collectFromParsed(parsed, msgs);
      if (msgs.length === 0 && raw) msgs.push(raw);
    } else if (err && typeof err === 'object' && 'message' in (err as any)) {
      msgs.push(String((err as any).message));
    }
    // Try common HttpErrorResponse shapes without importing HttpClient symbols
    const anyErr: any = err as any;
    if (msgs.length === 0 && anyErr && typeof anyErr === 'object' && 'error' in anyErr) {
      const rawErr = anyErr.error;
      if (typeof rawErr === 'string' && rawErr.trim()) {
        msgs.push(rawErr);
      } else if (rawErr && typeof rawErr === 'object') {
        this.collectFromParsed(rawErr, msgs);
      }
    }
    // If err itself is a plain string
    if (msgs.length === 0 && typeof err === 'string' && err.trim()) msgs.push(err);
    if (msgs.length === 0) msgs.push('Registration failed. Please check the form and try again.');
    return Array.from(new Set(msgs.map(s => s.trim()).filter(Boolean)));
  }

  private tryParseJson(text: string): any | null {
    try { return text ? JSON.parse(text) : null; } catch { return null; }
  }

  private collectFromParsed(parsed: any, out: string[]) {
    if (!parsed) return;
    if (Array.isArray(parsed)) { for (const i of parsed) if (typeof i === 'string') out.push(i); return; }
    if (typeof parsed === 'string') { out.push(parsed); return; }
    const candidates = [parsed?.message, parsed?.error, parsed?.title, parsed?.detail];
    for (const c of candidates) { if (typeof c === 'string' && c.trim()) out.push(c); if (Array.isArray(c)) out.push(...(c as string[])); }
    if (parsed?.errors && typeof parsed.errors === 'object') {
      for (const key of Object.keys(parsed.errors)) {
        const val = (parsed.errors as any)[key];
        if (Array.isArray(val)) out.push(...val.map((v: any) => String(v)));
        else if (typeof val === 'string') out.push(val);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.passwordCheckTimer) clearTimeout(this.passwordCheckTimer);
    this.passwordCheckSub?.unsubscribe();
  }
}
