import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { BlogComponent } from './components/blog/blog.component'
import { HomeComponent } from './components/home/home.component'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'blog',
                component: BlogComponent,
                children: [
                    {
                        path: '',
                        component: HomeComponent,
                        outlet: 'blog'
                    }
                ]
            },
        ]),
    ],
    exports: [RouterModule],
})
export class BlogRoutingModule {}
