import { NgModule } from '@angular/core'

import { SharedModule } from '../shared/shared.module'
import { BlogRoutingModule } from './blog-routing.module'

import { BlogComponent } from './components/blog/blog.component'
import { HomeComponent } from './components/home/home.component'

@NgModule({
  imports: [
    SharedModule.forRoot(),
    BlogRoutingModule,
  ],
  declarations: [
    HomeComponent,
    BlogComponent,
  ],
})
export class BlogModule { }
