import { Component, OnInit } from '@angular/core'
import { ApiEndpoints } from '@mte/common/constants/api-endpoints'

@Component({
    selector: 'mte-shop-home',
    templateUrl: './shop-home.component.html',
    styleUrls: ['./shop-home.component.scss']
})
export class ShopHomeComponent implements OnInit {
    public instagramEndpoint = ApiEndpoints.Instagram

    public ngOnInit(): void { }
}