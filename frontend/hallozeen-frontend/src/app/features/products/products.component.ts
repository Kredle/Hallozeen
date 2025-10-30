import { Component } from '@angular/core';
import { HallozeenApiClient } from '../../api/hallozeen-api-client';

@Component({
  selector: 'app-products.component',
  imports: [],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  constructor(private apiClient: HallozeenApiClient) {}
}
