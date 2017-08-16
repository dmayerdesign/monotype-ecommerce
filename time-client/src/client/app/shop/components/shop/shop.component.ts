import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { IProduct } from '../../../../../../../time-common/models/interfaces';
import { ProductService } from '../../services';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  products$: Observable<IProduct[]>;

  constructor(
    private productService: ProductService,
  ) { }

  ngOnInit() {
    this.products$ = this.productService.get();
  }

}
