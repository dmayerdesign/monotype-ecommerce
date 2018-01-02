import { Component, OnInit } from '@angular/core'

import { User } from '@time/common/models/api-models/user'
import { UserService } from '../../../shared/services/user.service'

@Component({
    selector: 'time-shop-primary-nav',
    templateUrl: './shop-primary-nav.component.html',
    styleUrls: ['./shop-primary-nav.component.scss']
})
export class ShopPrimaryNavComponent implements OnInit {
    public user: User

    constructor(
        public userService: UserService
    ) { }

    public ngOnInit() {
        this.userService.user$.subscribe((user) => this.user = user)
    }

}
