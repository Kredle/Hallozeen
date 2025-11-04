import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HallozeenApiClient, UserDto, ApiException } from '../../api/hallozeen-api-client';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  activeTab: 'details' | 'orders' = 'details';
  user: UserDto | null = null;
  orders: any[] = [];
  loadingUser = true;
  loadingOrders = true;
  errorUser: string | null = null;
  errorOrders: string | null = null;
  expanded = new Set<string>();
  details: Record<string, any> = {};
  loadingDetails = new Set<string>();

  constructor(private api: HallozeenApiClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Load user
    this.api.user().subscribe({
      next: (u) => {
        this.user = u ?? null;
        this.loadingUser = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorUser = this.extractError(err) || 'Failed to load user';
        this.loadingUser = false;
        this.cdr.detectChanges();
      }
    });

    // Load orders list
    this.api.ordersAll().subscribe({
      next: (list) => {
        this.orders = Array.isArray(list) ? list : [];
        this.loadingOrders = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorOrders = this.extractError(err) || 'Failed to load orders';
        this.loadingOrders = false;
        this.cdr.detectChanges();
      }
    });
  }

  private extractError(err: unknown): string | null {
    try {
      if (ApiException.isApiException && ApiException.isApiException(err)) {
        const raw = (err as any).response?.toString?.() ?? '';
        if (!raw) return err?.toString?.() ?? 'Error';
        try {
          const parsed = JSON.parse(raw);
          if (typeof parsed === 'string') return parsed;
          const msg = parsed?.message || parsed?.error || parsed?.title || parsed?.detail;
          if (typeof msg === 'string') return msg;
        } catch {}
        return raw;
      }
      if (err && typeof err === 'object' && 'message' in (err as any)) return String((err as any).message);
      return err?.toString?.() ?? null;
    } catch { return null; }
  }

  setTab(tab: 'details' | 'orders') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  goToCart() { (window as any).location.href = '/shopping-bag'; }
  goProfile() { (window as any).location.href = '/profile'; }

  toggleOrder(o: any) {
    const id = this.orderIdOf(o);
    if (!id) return;
    if (this.expanded.has(id)) {
      this.expanded.delete(id);
      this.cdr.detectChanges();
      return;
    }
    this.expanded.add(id);
    if (!this.details[id]) {
      this.loadingDetails.add(id);
      this.api.orders(id).subscribe({
        next: (d) => {
          this.details = { ...this.details, [id]: d };
          this.loadingDetails.delete(id);
          this.cdr.detectChanges();
        },
        error: () => {
          this.details = { ...this.details, [id]: { error: 'Failed to load order details' } };
          this.loadingDetails.delete(id);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  isExpanded(o: any): boolean { const id = this.orderIdOf(o); return !!id && this.expanded.has(id); }
  orderIdOf(o: any): string { return String(o?.id ?? o?.orderId ?? o ?? ''); }

  productsOf(detail: any): any[] {
    if (!detail) return [];
    if (Array.isArray(detail?.products)) return detail.products;
    if (Array.isArray(detail?.items)) return detail.items;
    if (Array.isArray(detail)) return detail;
    return [];
  }

  isLoading(o: any): boolean { const id = this.orderIdOf(o); return !!id && this.loadingDetails.has(id); }
}
