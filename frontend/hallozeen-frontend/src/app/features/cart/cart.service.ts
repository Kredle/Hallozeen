import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface CartItem {
  productId: number;
  quantity: number;
  name?: string;
  cost?: number;
  imageUrl?: string | null;
  weirdCostTitle?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly keyPrefix = 'hallozeen.cart.';
  private readonly guestKey = this.keyPrefix + 'guest';
  private auth = inject(AuthService);

  private currentKey: string | null = null;
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor() {
    this.ensureKeyUpToDate();
  }

  private storageKey(): string {
    const token = this.auth.getToken();
    return this.keyPrefix + (token ?? 'guest');
  }

  private ensureKeyUpToDate() {
    const newKey = this.storageKey();
    if (newKey === this.currentKey) return;
    this.currentKey = newKey;
    const items = this.load(newKey);
    this.itemsSubject.next(items);
  }

  private load(key: string): CartItem[] {
    try {
      const raw = localStorage.getItem(key);
      let items: CartItem[] = raw ? (JSON.parse(raw) as CartItem[]) : [];
      if (!Array.isArray(items)) items = [];

      // Migrate guest cart to user cart on first access after login
      const token = this.auth.getToken();
      if (token && key !== this.guestKey && items.length === 0) {
        const guestRaw = localStorage.getItem(this.guestKey);
        const guestItems: CartItem[] = guestRaw ? (JSON.parse(guestRaw) as CartItem[]) : [];
        if (Array.isArray(guestItems) && guestItems.length) {
          localStorage.setItem(key, JSON.stringify(guestItems));
          localStorage.removeItem(this.guestKey);
          return guestItems;
        }
      }
      return items;
    } catch {
      return [];
    }
  }

  private save(items: CartItem[]) {
    this.ensureKeyUpToDate();
    if (!this.currentKey) return;
    localStorage.setItem(this.currentKey, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  getSnapshot(): CartItem[] {
    this.ensureKeyUpToDate();
    return this.itemsSubject.getValue();
  }

  clear() {
    this.save([]);
  }

  setQuantity(productId: number, quantity: number, snapshot?: Partial<CartItem>) {
    this.ensureKeyUpToDate();
    if (quantity <= 0) return this.removeAll(productId);
    const items = this.getSnapshot();
    const idx = items.findIndex(i => i.productId === productId);
    if (idx >= 0) {
      const existing = items[idx];
      items[idx] = { ...existing, ...snapshot, productId, quantity };
      this.save([...items]);
    } else {
      this.save([...items, { productId, quantity, ...snapshot }]);
    }
  }

  add(productId: number, delta: number = 1, snapshot?: Partial<CartItem>) {
    this.ensureKeyUpToDate();
    const items = this.getSnapshot();
    const idx = items.findIndex(i => i.productId === productId);
    if (idx >= 0) {
      const nextQty = items[idx].quantity + delta;
      if (nextQty <= 0) {
        this.removeAll(productId);
      } else {
        const existing = items[idx];
        items[idx] = { ...existing, ...snapshot, productId, quantity: nextQty };
        this.save([...items]);
      }
    } else {
      if (delta > 0) this.save([...items, { productId, quantity: delta, ...snapshot }]);
    }
  }

  removeOne(productId: number) {
    this.add(productId, -1);
  }

  removeAll(productId: number) {
    this.ensureKeyUpToDate();
    const items = this.getSnapshot().filter(i => i.productId !== productId);
    this.save(items);
  }
}
