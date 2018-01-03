import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { blogRoutes } from './blog/blog.routes'
import { BlogComponent } from './blog/containers/blog/blog.component'
import { ShopComponent } from './shop/containers/shop/shop.component'
import { shopRoutes } from './shop/shop.routes'

@NgModule({
    imports: [
        RouterModule.forRoot([
            // {
            //     path: 'admin',
            //     loadChildren: './admin/admin.module#AdminModule'
            // },
            {
                path: 'blog',
                component: BlogComponent,
                children: blogRoutes,
            },
            {
                path: 'shop',
                component: ShopComponent,
                children: shopRoutes,
            },
            {
                path: '**',
                redirectTo: '/shop',
                pathMatch: 'full'
            },
        ]),
    ],
    exports: [ RouterModule ],
})
export class AppServerRoutingModule {}
