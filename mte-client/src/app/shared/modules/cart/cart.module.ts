import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { CartEffects } from './cart.effects'

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
    ],
    providers: [
        CartEffects
    ]
})
export class CartModule { }
