import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { MteFormsModule } from '@mte/common/lib/ng-modules/forms'
import { MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteUiModule } from '@mte/common/lib/ng-modules/ui'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { SharedComponentsModule } from '../shared-components/shared-components.module'
import { CartEffects } from './cart.effects'
import { cartReducer } from './cart.reducer'
import { cartSelectorKey } from './cart.selectors'
import { initialCartState } from './cart.state'

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        MteFormsModule,
        MteHttpModule.forChild(),
        MteUiModule.forChild(),
        SharedComponentsModule,
        StoreModule.forFeature(cartSelectorKey, cartReducer, { initialState: initialCartState }),
        EffectsModule.forFeature([ CartEffects ])
    ],
    providers: [
        CartEffects
    ]
})
export class CartModule { }
