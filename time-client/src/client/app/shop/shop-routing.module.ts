import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShopComponent } from './components/shop/shop.component';
// import { CartComponent } from './cart/cart.component';
// import { TaxonomyComponent } from './taxonomy/taxonomy.component';
// import { CheckoutComponent } from './checkout/checkout.component';
// import { ProductDetailComponent } from './product-detail/product-detail.component';

@NgModule({
  imports: [
  	RouterModule.forChild([
  		{ 
        path: 'shop',
        children: [
          // { path: 'for/:taxonomy/:value', component: TaxonomyComponent },
          // { path: 'product/:slug', component: ProductDetailComponent },
          // { path: 'cart', component: CartComponent },
          // { path: 'checkout', component: CheckoutComponent },
          { path: '', component: ShopComponent },
        ],
      }, 
  	]),
	],
  exports: [RouterModule],
})
export class ShopRoutingModule {}