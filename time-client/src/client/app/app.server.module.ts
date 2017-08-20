import { NgModule } from '@angular/core'
import { ServerModule } from '@angular/platform-server'

import { AppModule } from './app.module'
import { SiteModule } from './site/site.module'
import { ShopModule } from './shop/shop.module'
import { AppComponent } from './app.component'

import { HomeComponent } from './site/components/home/home.component'
import { ShopComponent } from './shop/components/shop/shop.component'

@NgModule({
  imports: [
    // The AppServerModule should import your AppModule followed
    // by the ServerModule from @angular/platform-server.
    // SiteModule,
    // ShopModule,
    AppModule,
    ServerModule,
  ],
  
  // entryComponents: [
  //   HomeComponent,
  //   ShopComponent,
  // ],
  
  // Since the bootstrapped component is not inherited from your
  // imported AppModule, it needs to be repeated here.
  bootstrap: [AppComponent],
})
export class AppServerModule {}
