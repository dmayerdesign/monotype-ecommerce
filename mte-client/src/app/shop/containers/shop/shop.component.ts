import { Component, OnInit } from '@angular/core'
import { UiService } from '../../../shared/services'

@Component({
    selector: 'shop',
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit {
    constructor(
        public ui: UiService,
    ) { }

    public ngOnInit(): void {
        this.ui.setTitle('Shop')
    }
}
