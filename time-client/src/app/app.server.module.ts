import { NgModule } from '@angular/core'
import { ServerModule } from '@angular/platform-server'
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component'
import { AppModule } from './app.module'
import { SharedModule } from './shared/shared.module'

@NgModule({
  imports: [
    // The AppServerModule should import your AppModule followed
    // by the ServerModule from @angular/platform-server.
    RouterModule.forRoot([]),
    SharedModule.forRoot(),
    AppModule,
    ServerModule,
  ],

  // Since the bootstrapped component is not inherited from your
  // imported AppModule, it needs to be repeated here.
  bootstrap: [AppComponent],
})
export class AppServerModule {}
