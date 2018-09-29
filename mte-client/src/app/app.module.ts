import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app.routing.module'
import { CartEffects } from './shared/modules/cart/cart.effects'
import { cartReducer } from './shared/modules/cart/cart.reducer'
import { initialCartState } from './shared/modules/cart/cart.state'
import { SharedModule } from './shared/shared.module'

@NgModule({
    imports: [
        // ANGULAR UNIVERSAL
        BrowserModule.withServerTransition({ appId: 'mte-client-universal' }),
        BrowserAnimationsModule,
        SharedModule.forRoot(),
        AppRoutingModule,
        StoreModule.forRoot({
            cart: cartReducer
        }, {
            initialState: {
                cart: initialCartState
            }
        }),
        EffectsModule.forRoot([ CartEffects ]),
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [ AppComponent ],
})
export class AppModule { }
