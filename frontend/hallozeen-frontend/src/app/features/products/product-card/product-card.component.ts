import { Component, HostListener, Input, ElementRef } from '@angular/core';
import { ProductDto } from '../../../api/hallozeen-api-client';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product?: ProductDto;
  @Input() selected = false;
  
  constructor(private el: ElementRef<HTMLElement>, private cart: CartService) {}

  get displayTitle(): string {
    return this.product?.name ?? 'The Grimoire of Glitches';
  }

  get displayPrice(): number | string {
    return this.product?.cost ?? this.product?.weirdCostTitle ?? '???';
  }

  get imageSrc(): string | undefined {
    return this.product?.imageUrl as string | undefined;
  }

  toggleSelected(): void {
    this.selected = !this.selected;
  }

  addToCart(event: MouseEvent): void {
    event.stopPropagation();
    const id = this.product?.id;
    if (id != null) {
      this.cart.add(id, 1, {
        name: this.product?.name ?? undefined,
        cost: this.product?.cost ?? undefined,
        imageUrl: (this.product?.imageUrl as any) ?? undefined,
        weirdCostTitle: (this.product as any)?.weirdCostTitle ?? undefined
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.selected) return;
    const target = event.target as Node | null;
    if (!target) return;
    const clickedInside = this.el.nativeElement.contains(target);
    if (!clickedInside) {
      this.selected = false;
    }
  }
}
