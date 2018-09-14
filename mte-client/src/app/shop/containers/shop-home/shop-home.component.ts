import { Component } from '@angular/core'
import { ApiEndpoints } from '@mte/common/constants/api-endpoints'

@Component({
    selector: 'mte-shop-home',
    templateUrl: './shop-home.component.html',
    styleUrls: ['./shop-home.component.scss']
})
export class ShopHomeComponent {
    public instagramEndpoint = ApiEndpoints.Instagram
}
