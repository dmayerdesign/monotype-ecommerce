import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ServerModule } from '@angular/platform-server'
import { MteFormsModule } from '@mte/common/lib/ng-modules/forms'
import { HttpInjectionTokens, MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteUiModule } from '@mte/common/lib/ng-modules/ui'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { AppServerComponent } from './app.server.component'
import { AppServerRoutingModule } from './app.server.routing.module'
import { BlogModule } from './blog/blog.module'
import { CartModule } from './cart/cart.module'
import { HttpSettings } from './config/http.settings'
import { SharedComponentsModule } from './shared-components/shared-components.module'
import { ShopModule } from './shop/shop.module'

@NgModule({
    imports: [
        // ANGULAR UNIVERSAL
        BrowserModule.withServerTransition({ appId: 'mte-client-universal' }),
        BrowserAnimationsModule,
        SharedComponentsModule,
        AppServerRoutingModule,
        ShopModule,
        BlogModule,
        ServerModule,
        MteFormsModule,
        MteHttpModule.forRoot(),
        MteUiModule.forRoot(),
        CartModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
    ],
    providers: [
        {
            provide: HttpInjectionTokens.HttpSettings,
            useValue: HttpSettings,
        },
    ],
    declarations: [
        AppServerComponent,
    ],
    bootstrap: [ AppServerComponent ],
})
export class AppServerModule { }
