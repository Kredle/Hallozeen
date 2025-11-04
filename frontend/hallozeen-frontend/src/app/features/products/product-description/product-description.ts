import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ProductDto } from '../../../api/hallozeen-api-client';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-product-description',
  standalone: true,
  imports: [],
  templateUrl: './product-description.html',
  styleUrl: './product-description.scss'
})
export class ProductDescription {
  @Input() product?: ProductDto;
  @Output() dismiss = new EventEmitter<void>();

  constructor(private cart: CartService) {}

  addToCart() {
    const id = this.product?.id;
    if (id != null) {
      this.cart.add(id, 1, {
        name: this.product?.name ?? undefined,
        cost: this.product?.cost ?? undefined,
        imageUrl: (this.product?.imageUrl as any) ?? undefined,
        weirdCostTitle: (this.product as any)?.weirdCostTitle ?? undefined
      });
      // Optionally close after add
      // this.dismiss.emit();
    }
  }
}
