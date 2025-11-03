import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ProductDto } from '../../../api/hallozeen-api-client';

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
}

