import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

@NgModule({
    imports: [
        RouterModule.forRoot([
            // {
            //     path: 'admin',
            //     loadChildren: './admin/admin.module#AdminModule'
            // },
            {
                path: 'blog',
                loadChildren: './blog/blog.module#BlogModule'
            },
            {
                path: 'shop',
                loadChildren: './shop/shop.module#ShopModule'
            },
            {
                path: '**',
                redirectTo: '/shop',
                pathMatch: 'full'
            },
        ]),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
