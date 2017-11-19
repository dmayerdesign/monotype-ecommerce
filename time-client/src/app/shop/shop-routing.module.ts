import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CartComponent } from './components/cart/cart.component'
import { CheckoutComponent } from './components/checkout/checkout.component'
import { ProductDetailComponent } from './components/product-detail/product-detail.component'
import { ShopComponent } from './components/shop/shop.component'
import { TaxonomyComponent } from './components/taxonomy/taxonomy.component'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'shop',
                children: [
                    { path: 'for/:taxonomy/:value', component: TaxonomyComponent },
                    { path: 'product/:slug', component: ProductDetailComponent },
                    { path: 'cart', component: CartComponent },
                    { path: 'checkout', component: CheckoutComponent },
                    { path: '', component: ShopComponent },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class ShopRoutingModule {}
