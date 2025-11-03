import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HallozeenApiClient, RegisterRequestDTO, ApiException } from '../../../api/hallozeen-api-client';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  passValidation = '';
  passValidation2 = '';

  isSubmitted = signal(false);
  isLoading = signal(false);
  registerFailed = signal(false);
  errorMessages = signal<string[]>([]);

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

  constructor(private api: HallozeenApiClient) {}

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
        // Reset form on unsuccessful attempt
        form.resetForm({
          name: '',
          email: '',
          password: '',
          passValidation: '',
          passValidation2: ''
        });
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
      const raw = apiErr.response?.toString() ?? '';
      const parsed = this.tryParseJson(raw);
      if (parsed != null) this.collectFromParsed(parsed, msgs);
      if (msgs.length === 0 && raw) msgs.push(raw);
    } else if (err && typeof err === 'object' && 'message' in (err as any)) {
      msgs.push(String((err as any).message));
    }
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
}
