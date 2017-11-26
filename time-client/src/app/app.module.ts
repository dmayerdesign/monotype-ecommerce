import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component'
import { SharedModule } from './shared/shared.module'
import { ShopModule } from './shop/shop.module'
import { SiteModule } from './site/site.module'

@NgModule({
    imports: [
        // ANGULAR UNIVERSAL
        BrowserModule.withServerTransition({ appId: 'time-client-universal' }),
        RouterModule.forRoot([]),
        SharedModule.forRoot(),
        SiteModule,
        ShopModule,
    ],
    declarations: [
        AppComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
