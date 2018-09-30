import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { SharedModule } from '../shared/shared.module'
import { CartEffects } from './cart.effects'
import { cartReducer } from './cart.reducer'
import { cartSelectorKey } from './cart.selectors'
import { initialCartState as initialState } from './cart.state'

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        SharedModule.forChild(),
        StoreModule.forFeature(cartSelectorKey, cartReducer, { initialState }),
        EffectsModule.forFeature([ CartEffects ])
    ],
    providers: [
        CartEffects
    ]
})
export class CartModule { }
