import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { SharedModule } from '../shared/shared.module'
import { SiteRoutingModule } from './site-routing.module'

import { HomeComponent } from './components/home/home.component'

@NgModule({
  imports: [
    CommonModule,
    SiteRoutingModule,
    SharedModule.forRoot(),
  ],
  declarations: [
    HomeComponent,
  ],
})
export class SiteModule { }
