////////////////////////////////////////////////////////////// //// // / //    /
//////////////////////////////////////////////////////// ///// // / ///   / /
////////////////////////////////////////////////////// //////  ///  / //    /
/////////////////                  ///////////////////////////  //// //
/////////////////    shop.module   //////////////////// ///   ///    /   //
/////////////////                  ////////////////// // ////    /// //
/////////////////////////////////////////////////////// //////  / /// /
//////////////////////////////////////////////////////// /////// / /
//////////////////////////////////////////////////////////////  ///
///////       //    ////    /////////          //////// //// ///  //
/////  //////////  //////  ////   ////  ///////  ///////////// ///
/////  //////////  //////  ///     ///  ///////  /////////// // ///
///////       ///          ///     ///         ///////// ////  //
////////////// //  //////  ///     ///  ////////////////////// ///
/////////////  //  //////  ////   ////  ///////////////////// // /
/////        ///    ////    /////////    /////////////////////// //
///////////////////////////////////////////////////////////// ///
/////////////////////////////////////////////////////////////// /

// If we want to let folks shop, we'll need a few things.

// Angular dependencies.
import { NgModule } from '@angular/core'

// Components.
import { PaginationComponent } from './components/pagination/pagination.component'
import { ProductImageComponent } from './components/product-image/product-image.component'
import { ProductsByTermComponent } from './components/products-by-term/products-by-term.component'
import { ProductsGridComponent } from './components/products-grid/products-grid.component'
import { ProductsComponent } from './components/products/products.component'
import { ShopPrimaryNavComponent } from './components/shop-primary-nav/shop-primary-nav.component'
import { CartComponent } from './containers/cart/cart.component'
import { CheckoutComponent } from './containers/checkout/checkout.component'
import { ProductDetailComponent } from './containers/product-detail/product-detail.component'
import { ShopAllComponent } from './containers/shop-all/shop-all.component'
import { ShopComponent } from './containers/shop/shop.component'
import { TaxonomyComponent } from './containers/taxonomy/taxonomy.component'

// Services.
import { CheckoutService } from './services/checkout.service'

// Modules.
import { SharedModule } from '../shared/shared.module'

//      Routing modules.
import { ShopRoutingModule } from './shop.routing.module';
import { HomeComponent } from './containers/home/home.component'

// Now all we need to do is configure the entire "shop" module, piece by piece.
@NgModule({
    // We need some @NgModules,
    imports: [
        SharedModule.forChild(),
        ShopRoutingModule,
    ],
    // some components and pipes and stuff,
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
        ProductsByTermComponent,
        ShopAllComponent,
        ProductImageComponent,
        HomeComponent,
    ],
    // and we want to share some things with other modules, in case somebody wants to
    // import us,
    exports: [
        CartComponent,
        CheckoutComponent,
        TaxonomyComponent,
        ProductDetailComponent,
        ShopPrimaryNavComponent,
    ],
    // and we want some stuff to be guaranteed with a contract.
    providers: [
        CheckoutService,
    ],
})
export class ShopModule { }
