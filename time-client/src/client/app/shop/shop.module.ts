import { CommonModule } from '@angular/common'
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { HttpResponseInterceptor } from '../shared/services/http-response.interceptor'

import { SharedModule } from '../shared/shared.module'

import { CartComponent } from './components/cart/cart.component'
import { CheckoutComponent } from './components/checkout/checkout.component'
import { ProductDetailComponent } from './components/product-detail/product-detail.component'
import { ShopComponent } from './components/shop/shop.component'
import { TaxonomyComponent } from './components/taxonomy/taxonomy.component'
import { ShopRoutingModule } from './shop-routing.module'

import { ProductService } from './services'

@NgModule({
    imports: [
        CommonModule,
        SharedModule.forRoot(),
        ShopRoutingModule,
    ],
    declarations: [
        ShopComponent,
        CartComponent,
        CheckoutComponent,
        TaxonomyComponent,
        ProductDetailComponent,
    ],
    exports: [
        CartComponent,
        CheckoutComponent,
        TaxonomyComponent,
        ProductDetailComponent,
    ],
    providers: [
        ProductService,
        // HttpResponseInterceptor,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpResponseInterceptor,
            multi: true,
        },
    ],
})
export class ShopModule { }
