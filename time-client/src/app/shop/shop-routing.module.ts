import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CartComponent } from './containers/cart/cart.component'
import { CheckoutComponent } from './containers/checkout/checkout.component'
import { ProductDetailComponent } from './containers/product-detail/product-detail.component'
import { ShopComponent } from './containers/shop/shop.component'
import { TaxonomyComponent } from './containers/taxonomy/taxonomy.component'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'shop',
                component: ShopComponent,
                children: [
                    {
                        path: 'for/:taxonomy/:value',
                        component: TaxonomyComponent,
                        outlet: 'shop'
                    },
                    {
                        path: 'product/:slug',
                        component: ProductDetailComponent,
                        outlet: 'shop'
                    },
                    {
                        path: 'cart',
                        component: CartComponent,
                        outlet: 'shop'
                    },
                    {
                        path: 'checkout',
                        component: CheckoutComponent,
                        outlet: 'shop'
                    },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class ShopRoutingModule {}
