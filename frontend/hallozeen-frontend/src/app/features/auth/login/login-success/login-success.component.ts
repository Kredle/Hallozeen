import { Component } from '@angular/core';

@Component({
  selector: 'app-login-success',
  imports: [],
  templateUrl: './login-success.component.html',
  styleUrl: './login-success.component.scss'
})
export class LoginSuccessComponent {

  onNavigateToProducts() {
    window.location.href = '/products';
  }
}
