import { CommonModule } from '@angular/common'
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { SharedModule } from '../shared/shared.module'
import { CartComponent } from './components/cart/cart.component'
import { CheckoutComponent } from './components/checkout/checkout.component'
import { ProductDetailComponent } from './components/product-detail/product-detail.component'
import { ShopComponent } from './components/shop/shop.component'
import { TaxonomyComponent } from './components/taxonomy/taxonomy.component'
import { ProductService } from './services/product.service'
import { ShopRoutingModule } from './shop-routing.module'

@NgModule({
    imports: [
        CommonModule,
        SharedModule.forRoot(),
        ShopRoutingModule,
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
