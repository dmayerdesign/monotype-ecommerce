import { NgModule } from '@angular/core'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { SharedModule } from '../shared/shared.module'
import { PaginationComponent } from './components/pagination/pagination.component'
import { ProductImageComponent } from './components/product-image/product-image.component'
import { ProductsGridComponent } from './components/products-grid/products-grid.component'
import { ShopPrimaryNavComponent } from './components/shop-primary-nav/shop-primary-nav.component'
import { TopNavComponent } from './components/top-nav/top-nav.component'
import { CartComponent } from './containers/cart/cart.component'
import { CheckoutComponent } from './containers/checkout/checkout.component'
import { ProductDetailVariableAttributesComponent } from './containers/product-detail/product-detail-variable-attributes/product-detail-variable-attributes.component'
import { ProductDetailComponent } from './containers/product-detail/product-detail.component'
import { ProductsComponent } from './containers/products/products.component'
import { ShopAllComponent } from './containers/shop-all/shop-all.component'
import { ShopHomeComponent } from './containers/shop-home/shop-home.component'
import { ShopComponent } from './containers/shop/shop.component'
import { TaxonomyComponent } from './containers/taxonomy/taxonomy.component'
import { ShopEffects } from './shop.effects'
import { shopReducer } from './shop.reducer'
import { ShopRoutingModule } from './shop.routing.module'
import { shopSelectorKey } from './shop.selectors'
import { initialShopState as initialState } from './shop.state'

@NgModule({
    imports: [
        SharedModule.forChild(),
        StoreModule.forFeature(shopSelectorKey, shopReducer, { initialState }),
        EffectsModule.forFeature([ ShopEffects ]),
        ShopRoutingModule,
    ],
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
    exports: [
        CartComponent,
        CheckoutComponent,
        TaxonomyComponent,
        ProductDetailComponent,
        ShopPrimaryNavComponent,
    ],
    providers: [
        ShopEffects
    ]
})
export class ShopModule { }
