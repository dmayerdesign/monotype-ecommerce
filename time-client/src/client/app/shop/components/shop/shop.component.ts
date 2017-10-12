import { AfterViewInit, Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { IProduct } from '@time/common/models/interfaces'
import { SimpleError } from '@time/common/ng-modules/http'
import { UiService, UserService } from '../../../shared/services'
import { ProductService } from '../../services'

@Component({
  selector: 'shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit, AfterViewInit {
  public products$: Observable<IProduct[]>
  public products: IProduct[]
  public productsError: SimpleError

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private ui: UiService,
  ) { }

  public ngOnInit() {
    this.productService.get()
  }

  public ngAfterViewInit() {
    console.log("Do login")
    this.userService.login({email: "sadfasf", password: "asdfasdfdsf"})
    this.products$ = this.productService.products$
    this.productService.products$.subscribe(
      products => {
        this.products = products
      },
    )
    this.productService.productsError$.subscribe(err => console.log("Error in shop component", err))
  }

}
