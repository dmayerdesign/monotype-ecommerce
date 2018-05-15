import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { buildRoutesFromMeta } from '@mte/common/helpers/routes.helper'
import { ShopComponent } from './containers/shop/shop.component'
import { shopRoutes } from './shop.routes'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: ShopComponent,
                children: shopRoutes,
            },
        ]),
    ],
    exports: [ RouterModule ],
})
export class ShopRoutingModule {}
