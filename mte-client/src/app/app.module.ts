import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MteFormsModule } from '@mte/common/lib/ng-modules/forms/mte-forms.module'
import { HttpInjectionTokens } from '@mte/common/lib/ng-modules/http'
import { MteHttpModule } from '@mte/common/lib/ng-modules/http/mte-http.module'
import { MteUiModule } from '@mte/common/lib/ng-modules/ui/mte-ui.module'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app.routing.module'
import { CartModule } from './cart/cart.module'
import { HttpSettings } from './config/http.settings'
import { SharedComponentsModule } from './shared-components/shared-components.module'

@NgModule({
    imports: [
        // ANGULAR UNIVERSAL
        BrowserModule.withServerTransition({ appId: 'mte-client-universal' }),
        BrowserAnimationsModule,
        SharedComponentsModule,
        AppRoutingModule,
        MteFormsModule,
        MteHttpModule.forRoot(),
        MteUiModule.forRoot(),
        CartModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
    ],
    declarations: [
        AppComponent,
    ],
    providers: [
        {
            provide: HttpInjectionTokens.HttpSettings,
            useValue: HttpSettings,
        },
    ],
    bootstrap: [ AppComponent ],
})
export class AppModule { }
