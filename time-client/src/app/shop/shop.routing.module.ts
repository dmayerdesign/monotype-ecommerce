import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ShopComponent } from './containers/shop/shop.component'
import { shopRoutes } from './shop.routes'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                // TODO: Server app doesn't know that this route is really /shop.
                // Pull children out into their own file and create two separate
                // routes files for server and client apps (and do same for blog).
                path: '',
                component: ShopComponent,
                children: shopRoutes,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class ShopRoutingModule {}
