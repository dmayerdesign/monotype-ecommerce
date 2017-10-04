import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'
import { TimeHttpResponseInterceptor } from '@time/common/ng-modules/http/http-response.interceptor'
import { SharedModule } from './shared/shared.module'

import { ShopModule } from './shop/shop.module'
import { SiteModule } from './site/site.module'

import { AppComponent } from './app.component'

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        // BrowserModule.withServerTransition({appId: 'time-client-universal'}),
        RouterModule.forRoot([]),
        SiteModule,
        ShopModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
