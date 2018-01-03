import { Component, OnInit } from '@angular/core'

import { Organization } from '@time/common/models/api-models/organization'
import { User } from '@time/common/models/api-models/user'
import { OrganizationService } from '../../../shared/services/organization.service'
import { UserService } from '../../../shared/services/user.service'

@Component({
    selector: 'time-shop-primary-nav',
    templateUrl: './shop-primary-nav.component.html',
    styleUrls: ['./shop-primary-nav.component.scss']
})
export class ShopPrimaryNavComponent implements OnInit {
    public user: User
    public organization: Organization

    constructor(
        public userService: UserService,
        public organizationService: OrganizationService,
    ) { }

    public ngOnInit(): void {
        this.userService.user$.subscribe((user) => this.user = user)
        this.organizationService.organization$.subscribe((organization) => this.organization = organization)
    }

}
