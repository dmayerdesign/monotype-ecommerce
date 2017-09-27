import { AfterViewInit, Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { SimpleError } from '@time/common/http'
import { IProduct } from '@time/common/models/interfaces'
import { UiService } from '../../../shared/services'
import { ProductService } from '../../services'

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit, AfterViewInit {
  public products$: Observable<IProduct[]>
  public products: IProduct[]
  public productsError: SimpleError

  constructor(
    private productService: ProductService,
    private ui: UiService,
  ) { }

  public ngOnInit() {
    this.productService.get()
  }

  public ngAfterViewInit() {
    this.products$ = this.productService.products$
    this.productService.products$.subscribe(
      products => {
        this.products = products
      },
      err => {
        console.log("Error in sub")
      },
    )
    // this.productService.productsError$.subscribe(err => this.ui.flashError(err))
  }

}
