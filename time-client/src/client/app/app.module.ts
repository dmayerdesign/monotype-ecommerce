import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { SiteModule } from './site/site.module'
import { ShopModule } from './shop/shop.module'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'time-client-universal'}),
    SiteModule,
    ShopModule,
    RouterModule.forRoot([
      // { path: '', loadChildren: './site/site.module#SiteModule' },
      // { path: 'shop', loadChildren: './shop/shop.module#ShopModule' },
      // { path: '**', redirectTo: '' },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
