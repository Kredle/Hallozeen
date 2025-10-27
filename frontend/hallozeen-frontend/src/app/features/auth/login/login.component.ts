import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  isSubmitted = false;
  loginFailed = false;

  constructor(private router: Router) {}

  onLogin(form: NgForm) {
    if (form.invalid) return;

    // Fake login check (replace with API call)
    const validEmail = 'test@hallozeen.com';
    const validPassword = 'dark1234';

    if (this.email === validEmail && this.password === validPassword) {
      this.loginFailed = false;
      this.isSubmitted = true;
      setTimeout(() => {
        this.router.navigate(['/login/success']);
      }, 2000);
    } else {
      this.loginFailed = true;
      this.isSubmitted = false;
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  onPopupClose() {
    this.isSubmitted = false;
  }

  onAdClick() {
    window.location.href = '/ad';
  }
}
