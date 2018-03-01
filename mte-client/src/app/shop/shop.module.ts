import { NgModule } from '@angular/core'

import { SharedModule } from '../shared/shared.module'
import { PaginationComponent } from './components/pagination/pagination.component'
import { ProductsGridComponent } from './components/products-grid/products-grid.component'
import { ProductsComponent } from './components/products/products.component'
import { ShopPrimaryNavComponent } from './components/shop-primary-nav/shop-primary-nav.component'
import { CartComponent } from './containers/cart/cart.component'
import { CheckoutComponent } from './containers/checkout/checkout.component'
import { ProductDetailComponent } from './containers/product-detail/product-detail.component'
import { ShopAllComponent } from './containers/shop-all/shop-all.component'
import { ShopComponent } from './containers/shop/shop.component'
import { TaxonomyComponent } from './containers/taxonomy/taxonomy.component'
import { CheckoutService } from './services/checkout.service'
import { ShopRoutingModule } from './shop.routing.module';
import { ProductImageComponent } from './components/product-image/product-image.component'

@NgModule({
    imports: [
        SharedModule.forChild(),
        ShopRoutingModule,
    ],
    declarations: [
        ShopComponent,
        CartComponent,
        CheckoutComponent,
        TaxonomyComponent,
        ProductDetailComponent,
        ShopPrimaryNavComponent,
        ProductsGridComponent,
        PaginationComponent,
        ProductsComponent,
        ShopAllComponent,
        ProductImageComponent,
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
    ],
})
export class ShopModule { }
