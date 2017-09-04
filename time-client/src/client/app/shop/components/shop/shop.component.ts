import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs'

import { SimpleError } from '@time/common/http'
import { IProduct } from '@time/common/models/interfaces'
import { ProductService } from '../../services'
import { UiService } from '../../../shared/services';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit, AfterViewInit {
  products$: Observable<IProduct[]>
  productsError: SimpleError
  
  constructor(
    private productService: ProductService,
    private ui: UiService,
  ) { }

  ngOnInit() {
    this.productService.get()    
  }

  ngAfterViewInit() {
    this.ui.flash("Hello!")

    this.products$ = this.productService.products$
    this.productService.productsError$.subscribe(err => this.ui.flashError(err))
  }

}
