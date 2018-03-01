import { Routes } from '@angular/router'

import { CartComponent } from './containers/cart/cart.component'
import { CheckoutComponent } from './containers/checkout/checkout.component'
import { ProductDetailComponent } from './containers/product-detail/product-detail.component'
import { ShopAllComponent } from './containers/shop-all/shop-all.component'
import { TaxonomyComponent } from './containers/taxonomy/taxonomy.component'

export const shopRoutes: Routes = [
    {
        path: 'all',
        component: ShopAllComponent,
    },
    {
        path: 'for/:taxonomy/:value',
        component: TaxonomyComponent,
    },
    {
        path: 'product/:slug',
        component: ProductDetailComponent,
    },
    {
        path: 'cart',
        component: CartComponent,
    },
    {
        path: 'checkout',
        component: CheckoutComponent,
    },
]
