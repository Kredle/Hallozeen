import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../cart/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shopping-bag',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping-bag.html',
  styleUrl: './shopping-bag.scss'
})
export class ShoppingBag implements OnInit {
  items: CartItem[] = [];
  total = 0; // known-cost total only
  hasUnknown = false; // at least one item without numeric cost

  // minimal card fields to gate total calculation; can be reused for checkout
  card = { number: '', cvv: '', expiry: '' };

  constructor(private cart: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cart.items$.subscribe(items => this.loadProducts(items));
  }

  private loadProducts(items: CartItem[]) {
    this.items = items;
    this.recalcTotals();
  }

  clear() {
    this.cart.clear();
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  inc(item: CartItem) {
    this.cart.add(item.productId, 1);
  }

  dec(item: CartItem) {
    this.cart.add(item.productId, -1);
  }

  remove(item: CartItem) {
    this.cart.removeAll(item.productId);
  }

  bottleItUp() {
    this.router.navigate(['/checkout']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }

  get cardEntered(): boolean {
    const { number, cvv, expiry } = this.card;
    return !!number && !!cvv && !!expiry;
  }

  private recalcTotals() {
    const known = this.items.filter(x => typeof x.cost === 'number');
    this.total = known.reduce((sum, x) => sum + ((x.cost as number) * x.quantity), 0);
    this.hasUnknown = this.items.some(x => x.cost == null);
  }
}
