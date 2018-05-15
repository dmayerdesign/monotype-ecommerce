import { Component } from '@angular/core'

@Component({
    selector: 'mte-shop',
    template: `
        <mte-shop-primary-nav></mte-shop-primary-nav>
        <router-outlet></router-outlet>
    `,
    styleUrls: ['./shop.component.scss'],
})
export class ShopComponent { }
