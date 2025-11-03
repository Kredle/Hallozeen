import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(private apiClient: HallozeenApiClient, private cdr: ChangeDetectorRef) {}

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
    this.selectedProduct = p;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
    this.cdr.detectChanges();
  }
}
