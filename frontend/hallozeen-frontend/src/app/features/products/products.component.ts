import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HallozeenApiClient, ProductDto } from '../../api/hallozeen-api-client';
import { ProductCardComponent } from "./product-card/product-card.component";
import { ProductDescription } from "./product-description/product-description";

@Component({
  selector: 'app-products.component',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, ProductDescription],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: ProductDto[] = [];
  showModal = false;
  selectedProduct: ProductDto | null = null;

  constructor(private apiClient: HallozeenApiClient, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.apiClient.productsAll().subscribe({
      next: (items) => {
        this.products = (items ?? []).slice(0, 10);
        this.cdr.detectChanges();
      },
      error: () => {
        this.products = [];
        this.cdr.detectChanges();
      }
    });
  }

  trackById = (_: number, item: ProductDto) => item.id ?? _;

  openProduct(p: ProductDto) {
    const id = p.id;
    if (id == null) {
      return;
    }

    // Open instantly with current data, then hydrate with full details
    this.selectedProduct = p;
    this.showModal = true;
    this.cdr.detectChanges();

    this.apiClient.products(id).subscribe({
      next: (full) => {
        this.selectedProduct = full;
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep modal open with existing lightweight data; optionally show a toast
        // this.showModal remains true and selectedProduct stays as p
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
    this.cdr.detectChanges();
  }

  goToCart() {
    this.router.navigate(['/shopping-bag']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }
}
