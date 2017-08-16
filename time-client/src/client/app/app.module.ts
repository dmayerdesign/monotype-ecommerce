import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { SiteModule } from './site/site.module';
import { ShopModule } from './shop/shop.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SiteModule,
    ShopModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
