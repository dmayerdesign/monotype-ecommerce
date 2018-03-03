import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ServerModule } from '@angular/platform-server'
import { RouterModule } from '@angular/router'

import { AppModule } from './app.module'
import { AppServerComponent } from './app.server.component'
import { AppServerRoutingModule } from './app.server.routing.module'
import { BlogModule } from './blog/blog.module'
import { SharedModule } from './shared/shared.module'
import { ShopModule } from './shop/shop.module'

@NgModule({
    imports: [
        // ANGULAR UNIVERSAL
        BrowserModule.withServerTransition({ appId: 'mte-client-universal' }),
        BrowserAnimationsModule,
        SharedModule.forRoot(),
        AppServerRoutingModule,
        ShopModule,
        BlogModule,
        ServerModule,
    ],
    declarations: [
        AppServerComponent,
    ],
    bootstrap: [ AppServerComponent ],
})
export class AppServerModule { }
