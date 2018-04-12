import { Routes } from '@angular/router'

import { ShopRoutePaths } from './constants/shop-route-paths'
import { CartComponent } from './containers/cart/cart.component'
import { CheckoutComponent } from './containers/checkout/checkout.component'
import { ProductDetailComponent } from './containers/product-detail/product-detail.component'
import { ProductsByTermComponent } from './containers/products-by-term/products-by-term.component'
import { ShopAllComponent } from './containers/shop-all/shop-all.component'
import { ShopHomeComponent } from './containers/shop-home/shop-home.component'

export const shopRoutes: Routes = [
    {
        path: ShopRoutePaths.home,
        component: ShopHomeComponent,
    },
    {
        path: ShopRoutePaths.shopAll,
        component: ShopAllComponent,
    },
    {
        path: ShopRoutePaths.productsByTaxonomy,
        component: ShopAllComponent,
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
