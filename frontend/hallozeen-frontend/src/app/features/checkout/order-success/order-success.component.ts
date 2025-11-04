import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.scss'
})
export class OrderSuccessComponent {
  orderId: string | null;
  error: string | null;
  isSubmitted = false;
  private redirectAfterPopup: string = '/products';

  constructor(private router: Router) {
    const state = (history?.state || {}) as any;
    this.orderId = typeof state.orderId === 'string' ? state.orderId : null;
    this.error = typeof state.error === 'string' ? state.error : null;
  }

  onBackToProducts() {
    this.redirectAfterPopup = '/products';
    this.isSubmitted = true;
  }

  onBackHome() {
    this.redirectAfterPopup = '/';
    this.isSubmitted = true;
  }

  onPopupClose() {
    this.isSubmitted = false;
    this.router.navigate([this.redirectAfterPopup]);
  }

  onAdClick() {
    (window as any).location.href = '/ad';
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }
}
