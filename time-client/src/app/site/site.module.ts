import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { SharedModule } from '../shared/shared.module'
import { SiteRoutingModule } from './site-routing.module'

import { HomeComponent } from './components/home/home.component'

@NgModule({
  imports: [
    SharedModule.forRoot(),
    SiteRoutingModule,
  ],
  declarations: [
    HomeComponent,
  ],
})
export class SiteModule { }
