import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MteFormsModule } from '@mte/common/lib/ng-modules/forms'
import { MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteUiModule } from '@mte/common/lib/ng-modules/ui'
import { SharedComponentsModule } from '../shared-components/shared-components.module'
import { BlogRoutingModule } from './blog.routing.module'
import { BlogComponent } from './containers/blog/blog.component'
import { HomeComponent } from './containers/home/home.component'

@NgModule({
  imports: [
    CommonModule,
    BlogRoutingModule,
    MteFormsModule,
    MteHttpModule.forChild(),
    MteUiModule.forChild(),
    SharedComponentsModule,
  ],
  declarations: [
    HomeComponent,
    BlogComponent,
  ],
})
export class BlogModule { }
