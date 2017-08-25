import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { SharedModule } from '../shared/shared.module'
import { ShopRoutingModule } from './shop-routing.module'
import { ShopComponent } from './components/shop/shop.component'

import { ProductService } from './services'

@NgModule({
  imports: [
    CommonModule,
    ShopRoutingModule,
    SharedModule.forRoot(),
  ],
  declarations: [
    ShopComponent,
  ],
  providers: [
    ProductService,
  ],
})
export class ShopModule { }
