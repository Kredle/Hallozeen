import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

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

  isSubmitted = false;

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

  onSubmit(form: NgForm) {
    if (!form.valid || !this.passwordsMatch) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      return;
    }

    const payload = {
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password
    };

    console.log('Register payload', payload);
    this.isSubmitted = true;
    // TODO: call API
  }

  navigateToLogin() {
    window.location.href = 'login';
  }

  onPopupClose() {
    window.location.href = 'register/success';
    this.isSubmitted = false;
  }

  onAdClick() {
    window.location.href = '/ad';
  }
}
