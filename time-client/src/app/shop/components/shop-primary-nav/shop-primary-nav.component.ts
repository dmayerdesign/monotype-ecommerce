import { AfterViewInit, Component, OnInit } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'

import { Organization } from '@time/common/models/api-models/organization'
import { User } from '@time/common/models/api-models/user'
import { OrganizationService } from '../../../shared/services/organization.service'
import { UiService } from '../../../shared/services/ui.service'
import { UserService } from '../../../shared/services/user.service'
import { ShopRouterLinks } from '../../constants/shop-router-links'

export interface NavigationItem {
    routerLink: string[]
    text: string
}

@Component({
    selector: 'time-shop-primary-nav',
    templateUrl: './shop-primary-nav.component.html',
    styleUrls: ['./shop-primary-nav.component.scss']
})
export class ShopPrimaryNavComponent implements AfterViewInit, OnInit {
    public user: User
    public organization: Organization
    public routerLinks = ShopRouterLinks
    public navbarId = 'navbar-nav'
    public fullScreenNavIsExpanded = false

    public leftNavigation: NavigationItem[] = [
        {
            text: 'Shop',
            routerLink: [ ShopRouterLinks.shop ],
        },
    ]

    public rightNavigation: NavigationItem[] = [
        {
            text: 'Checkout',
            routerLink: [ ShopRouterLinks.checkout ],
        },
    ]

    constructor(
        public userService: UserService,
        public organizationService: OrganizationService,
        public uiService: UiService,
        public router: Router,
    ) { }

    public ngOnInit(): void {
        this.userService.users.subscribe((user) => this.user = user)
        this.organizationService.organizations.subscribe((organization) => this.organization = organization)
    }

    public ngAfterViewInit(): void {
        this.router.events
            .filter((event) => event instanceof NavigationStart)
            .subscribe(() => this.toggleFullScreenNav(false))
    }

    public toggleFullScreenNav(shouldShow?: boolean): void {
        if (typeof shouldShow !== 'undefined') {
            this.fullScreenNavIsExpanded = shouldShow
        }
        else {
            this.fullScreenNavIsExpanded = !this.fullScreenNavIsExpanded
        }
    }
}
