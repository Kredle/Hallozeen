import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../cart/cart.service';
import { HallozeenApiClient, UserDto, GrandTotalRequestDTO, PaymentCardDto, PaymentProductDto, PaymentRequestDto, ApiException } from '../../api/hallozeen-api-client';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent implements OnInit {
  items: CartItem[] = [];
  total = 0; // known-cost subtotal
  hasUnknown = false;
  grandTotal: number | null = null;
  private fetchingTotal = false;
  isSubmitted = false;

  card = { number: '', cvv: '', expiry: '' };
  userEmail: string | null = null;
  username: string | null = null;

  constructor(
    private cart: CartService,
    private router: Router,
    private api: HallozeenApiClient,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cart.items$.subscribe(items => {
      this.items = items;
      this.recalc();
      this.cdr.detectChanges();
    });

    // Try API first
    this.api.user().subscribe({
      next: (u: UserDto) => {
        this.userEmail = u.email ?? null;
        this.username = u.username ?? null;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback: derive from JWT payload if available
        this.deriveUserFromToken();
        this.cdr.detectChanges();
      }
    });
  }

  private deriveUserFromToken() {
    try {
      const token = this.auth.getToken();
      if (!token) return;
      const parts = token.split('.');
      if (parts.length < 2) return;
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // pad base64 if needed
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
      const json = atob(padded);
      const payload = JSON.parse(json);
      // Try common claim names across providers
      this.userEmail = payload.email || payload.mail || payload.upn || payload.preferred_username || payload.emails?.[0] || null;
      this.username = payload.username || payload.unique_name || payload.name || payload.given_name || payload.sub || null;
    } catch {
      // ignore
    }
  }

  private recalc() {
    const known = this.items.filter(i => typeof i.cost === 'number');
    this.total = known.reduce((s, i) => s + (i.cost as number) * i.quantity, 0);
    this.hasUnknown = this.items.some(i => i.cost == null);
  }

  private digitsOnly(s: string): string { return (s || '').replace(/\D/g, ''); }

  get cardEntered(): boolean {
    const { number, cvv, expiry } = this.card;
    return !!number && !!cvv && !!expiry;
  }

  get cardValid(): boolean {
    const num = this.digitsOnly(this.card.number);
    const expiryOk = /^\d{2}\/\d{2}$/.test((this.card.expiry || '').trim());
    const cvvOk = /^\d{3}$/.test((this.card.cvv || '').trim());
    const numberOk = num.length >= 12 && num.length <= 19;
    return numberOk && expiryOk && cvvOk;
  }

  onCardChanged() {
    if (this.cardValid && !this.fetchingTotal) {
      this.tryCalc();
    }
  }

  tryCalc() {
    if (!this.cardValid) return;

    const req = new GrandTotalRequestDTO();
    req.products = this.items.map(i => new PaymentProductDto({ id: i.productId, quantity: i.quantity }));
    req.card = new PaymentCardDto({
      number: this.card.number,
      cvv: this.card.cvv,
      expiry: this.card.expiry,
    });

    if (this.fetchingTotal) return;
    this.fetchingTotal = true;
    this.grandTotal = null;
    // Call generated POST endpoint with DTO, handle number or { grandTotal }
    this.api.total(req).subscribe({
      next: (value: any) => {
        const v = typeof value === 'number' ? value : (value?.grandTotal ?? null);
        this.grandTotal = v;
        this.fetchingTotal = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // On error, force re-entering the card
        this.card = { number: '', cvv: '', expiry: '' };
        this.grandTotal = null;
        this.fetchingTotal = false;
        this.cdr.detectChanges();
      }
    });
  }

  sealThePact() {
    // Show the same popup as login/register
    this.isSubmitted = true;
  }

  cancel() {
    this.router.navigate(['/shopping-bag']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }

  onPopupClose() {
    this.isSubmitted = false;
    // Build payment request
    const req = new PaymentRequestDto();
    req.products = this.items.map(i => new PaymentProductDto({ id: i.productId, quantity: i.quantity }));
    req.card = new PaymentCardDto({
      number: this.card.number,
      cvv: this.card.cvv,
      expiry: this.card.expiry,
    });

    this.api.payment(req).subscribe({
      next: (orderId: string) => {
        this.router.navigate(['/order/success'], { state: { orderId } });
      },
      error: (err) => {
        let message = 'Payment failed.';
        try {
          if (ApiException.isApiException && ApiException.isApiException(err)) {
            const raw = (err as any).response?.toString?.() ?? '';
            // try parse JSON message
            try {
              const parsed = raw ? JSON.parse(raw) : null;
              const candidate = parsed?.message || parsed?.error || parsed?.title || parsed?.detail;
              if (typeof candidate === 'string') message = candidate;
              else if (typeof parsed === 'string') message = parsed;
            } catch {
              if (raw) message = raw;
            }
          } else if (err && typeof err === 'object' && 'message' in (err as any)) {
            message = String((err as any).message);
          }
        } catch {}
        this.router.navigate(['/order/success'], { state: { error: message } });
      }
    });
  }

  onAdClick() {
    (window as any).location.href = '/ad';
  }
}
