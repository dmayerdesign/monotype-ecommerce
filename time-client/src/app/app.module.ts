import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component'
import { AppRoutingModule } from './app.routing.module'
import { BlogModule } from './blog/blog.module'
import { SharedModule } from './shared/shared.module'
import { ShopModule } from './shop/shop.module'

@NgModule({
    imports: [
        // ANGULAR UNIVERSAL
        BrowserModule.withServerTransition({ appId: 'time-client-universal' }),
        BrowserAnimationsModule,
        SharedModule.forRoot(),
        BlogModule,
        ShopModule,
        AppRoutingModule,
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
