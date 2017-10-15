import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'

import { TimeUiModule } from '@time/common/ng-modules/ui'
import { AppComponent } from './app.component'
import { ShopModule } from './shop/shop.module'
import { SiteModule } from './site/site.module'

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        // BrowserModule.withServerTransition({appId: 'time-client-universal'}),
        RouterModule.forRoot([]),
        TimeUiModule,
        SiteModule,
        ShopModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
