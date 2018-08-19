// Angular dependencies.
import { NgModule } from '@angular/core'

// Components.
import { PaginationComponent } from './components/pagination/pagination.component'
import { ProductImageComponent } from './components/product-image/product-image.component'
import { ProductsGridComponent } from './components/products-grid/products-grid.component'
import { ShopPrimaryNavComponent } from './components/shop-primary-nav/shop-primary-nav.component'
import { CartComponent } from './containers/cart/cart.component'
import { CheckoutComponent } from './containers/checkout/checkout.component'
import { ProductDetailVariableAttributesComponent } from './containers/product-detail/product-detail-variable-attributes/product-detail-variable-attributes.component'
import { ProductDetailComponent } from './containers/product-detail/product-detail.component'
import { ProductsComponent } from './containers/products/products.component'
import { ShopAllComponent } from './containers/shop-all/shop-all.component'
import { ShopHomeComponent } from './containers/shop-home/shop-home.component'
import { ShopComponent } from './containers/shop/shop.component'
import { TaxonomyComponent } from './containers/taxonomy/taxonomy.component'

// Modules.
import { SharedModule } from '../shared/shared.module'

/// Routing modules.
import { TopNavComponent } from './components/top-nav/top-nav.component'
import { ShopRoutingModule } from './shop.routing.module'

// Now all we need to do is configure the entire ShopModule, piece by piece.
@NgModule({
    // We need some @NgModules,
    imports: [
        SharedModule.forChild(),
        ShopRoutingModule,
    ],
    // some components/directives/pipes,
    declarations: [
        ShopComponent,
        CartComponent,
        CheckoutComponent,
        TaxonomyComponent,
        ProductDetailComponent,
        ProductDetailVariableAttributesComponent,
        ShopPrimaryNavComponent,
        ProductsGridComponent,
        PaginationComponent,
        ProductsComponent,
        ShopAllComponent,
        ProductImageComponent,
        ShopHomeComponent,
        TopNavComponent,
    ],
    // and we want to share some things with other modules, in case somebody wants to
    // import us.
    exports: [
        CartComponent,
        CheckoutComponent,
        TaxonomyComponent,
        ProductDetailComponent,
        ShopPrimaryNavComponent,
    ],
})
export class ShopModule { }
