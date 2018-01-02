import { NgModule } from '@angular/core'

import { SharedModule } from '../shared/shared.module'
import { ShopPrimaryNavComponent } from './components/shop-primary-nav/shop-primary-nav.component'
import { CartComponent } from './containers/cart/cart.component'
import { CheckoutComponent } from './containers/checkout/checkout.component'
import { ProductDetailComponent } from './containers/product-detail/product-detail.component'
import { ShopComponent } from './containers/shop/shop.component'
import { TaxonomyComponent } from './containers/taxonomy/taxonomy.component'
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
