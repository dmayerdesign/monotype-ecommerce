import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { blogRoutes } from './blog.routes'
import { BlogComponent } from './containers/blog/blog.component'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: BlogComponent,
                children: blogRoutes
            },
        ]),
    ],
    exports: [RouterModule],
})
export class BlogRoutingModule {}
