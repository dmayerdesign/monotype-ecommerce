import { NgModule } from '@angular/core'

import { SharedModule } from '../shared/shared.module'
import { BlogRoutingModule } from './blog.routing.module'

import { BlogComponent } from './containers/blog/blog.component'
import { HomeComponent } from './containers/home/home.component'

@NgModule({
  imports: [
    SharedModule.forChild(),
    BlogRoutingModule,
  ],
  declarations: [
    HomeComponent,
    BlogComponent,
  ],
})
export class BlogModule { }
