import { NgModule } from '@angular/core'
import { MteFormsModule } from '@mte/common/lib/ng-modules/forms'
import { MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteUiModule } from '@mte/common/lib/ng-modules/ui'
import { SharedModule } from '../shared/shared.module'
import { BlogRoutingModule } from './blog.routing.module'
import { BlogComponent } from './containers/blog/blog.component'
import { HomeComponent } from './containers/home/home.component'

@NgModule({
  imports: [
    BlogRoutingModule,
    MteFormsModule,
    MteHttpModule.forChild(),
    MteUiModule.forChild(),
    SharedModule.forChild(),
  ],
  declarations: [
    HomeComponent,
    BlogComponent,
  ],
})
export class BlogModule { }
