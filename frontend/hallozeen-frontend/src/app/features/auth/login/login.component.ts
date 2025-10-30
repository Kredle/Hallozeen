import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { appConfig } from '../../../app.config';

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

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(form: NgForm) {
    if (form.invalid) return;

    this.isLoading.set(true);
    this.loginFailed.set(false);

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
}
