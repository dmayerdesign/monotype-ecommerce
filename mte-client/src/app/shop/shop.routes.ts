import { Routes } from '@angular/router'

import { ShopRoutePaths } from './constants/shop-route-paths'
import { CartComponent } from './containers/cart/cart.component'
import { CheckoutComponent } from './containers/checkout/checkout.component'
import { ProductDetailComponent } from './containers/product-detail/product-detail.component'
import { ShopAllComponent } from './containers/shop-all/shop-all.component'
import { TaxonomyComponent } from './containers/taxonomy/taxonomy.component'

export const shopRoutes: Routes = [
    {
        path: ShopRoutePaths.shopAll,
        component: ShopAllComponent,
    },
    {
        path: ShopRoutePaths.taxonomy,
        component: TaxonomyComponent,
    },
    {
        path: ShopRoutePaths.productDetail,
        component: ProductDetailComponent,
    },
    {
        path: ShopRoutePaths.cart,
        component: CartComponent,
    },
    {
        path: ShopRoutePaths.checkout,
        component: CheckoutComponent,
    },
]
