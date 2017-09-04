import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { SharedModule } from '../shared/shared.module'
import { TimeHttpModule } from '@time/common/http'

import { ShopRoutingModule } from './shop-routing.module'
import { ShopComponent } from './components/shop/shop.component'
import { CartComponent } from './components/cart/cart.component'
import { CheckoutComponent } from './components/checkout/checkout.component'
import { TaxonomyComponent } from './components/taxonomy/taxonomy.component'
import { ProductDetailComponent } from './components/product-detail/product-detail.component'

import { ProductService } from './services'

@NgModule({
  imports: [
    CommonModule,
    ShopRoutingModule,
    SharedModule.forRoot(),
    TimeHttpModule.forRoot(),
  ],
  declarations: [
    ShopComponent,
    CartComponent,
    CheckoutComponent,
    TaxonomyComponent,
    ProductDetailComponent,
  ],
  exports: [
    CartComponent,
    CheckoutComponent,
    TaxonomyComponent,
    ProductDetailComponent,
  ],
  providers: [
    ProductService,
  ],
})
export class ShopModule { }
