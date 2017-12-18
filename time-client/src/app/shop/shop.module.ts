import { NgModule } from '@angular/core'

import { SharedModule } from '../shared/shared.module'
import { CartComponent } from './components/cart/cart.component'
import { CheckoutComponent } from './components/checkout/checkout.component'
import { ProductDetailComponent } from './components/product-detail/product-detail.component'
import { ShopPrimaryNavComponent } from './components/shop-primary-nav/shop-primary-nav.component'
import { ShopComponent } from './components/shop/shop.component'
import { TaxonomyComponent } from './components/taxonomy/taxonomy.component'
import { CheckoutService } from './services/checkout.service'
import { ProductService } from './services/product.service'
import { ShopRoutingModule } from './shop-routing.module'

@NgModule({
    imports: [
        SharedModule.forRoot(),
        ShopRoutingModule,
    ],
    declarations: [
        ShopComponent,
        CartComponent,
        CheckoutComponent,
        TaxonomyComponent,
        ProductDetailComponent,
        ShopPrimaryNavComponent,
    ],
    exports: [
        CartComponent,
        CheckoutComponent,
        TaxonomyComponent,
        ProductDetailComponent,
        ShopPrimaryNavComponent,
    ],
    providers: [
        CheckoutService,
        ProductService,
    ],
})
export class ShopModule { }
