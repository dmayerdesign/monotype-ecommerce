import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app.routing.module'
import { CartModule } from './cart/cart.module'
import { SharedModule } from './shared/shared.module'

@NgModule({
    imports: [
        // ANGULAR UNIVERSAL
        BrowserModule.withServerTransition({ appId: 'mte-client-universal' }),
        BrowserAnimationsModule,
        AppRoutingModule,
        SharedModule.forRoot(),
        CartModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [ AppComponent ],
})
export class AppModule { }
