import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'

import { NavigationBuilder } from '@mte/common/builders/navigation.builder'
import { NavigationItem } from '@mte/common/models/api-models/navigation-item'
import { Organization } from '@mte/common/models/api-models/organization'
import { User } from '@mte/common/models/api-models/user'
import { WindowRefService } from '@mte/common/ng-modules/ui/services/window-ref.service'
import { OrganizationService } from '../../../shared/services/organization.service'
import { UiService } from '../../../shared/services/ui.service'
import { UserService } from '../../../shared/services/user.service'
import { ShopRouterLinks } from '../../constants/shop-router-links'

@Component({
    selector: 'mte-shop-primary-nav',
    templateUrl: './shop-primary-nav.component.html',
    styleUrls: ['./shop-primary-nav.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ShopPrimaryNavComponent implements AfterViewInit, OnInit {
    public user: User
    public organization: Organization
    public routerLinks = ShopRouterLinks
    public navbarId = 'navbar-nav'
    public fullScreenNavIsExpanded = false
    public leftNavigation: NavigationItem[] = []
    public rightNavigation: NavigationItem[] = []
    private navigationBuilder = new NavigationBuilder()

    constructor(
        public userService: UserService,
        public organizationService: OrganizationService,
        public windowRefService: WindowRefService,
        public router: Router,
    ) { }

    public ngOnInit(): void {
        this.userService.users.subscribe((user) => this.user = user)
        this.organizationService.organizations.subscribe((organization) => {
            this.organization = organization
            this.leftNavigation = this.navigationBuilder.items(
                this.organization.storeUiContent.primaryNavigation
                    .filter((item: NavigationItem) => item.isTopLevel) as NavigationItem[]
            )
        })
        this.rightNavigation = this.navigationBuilder.items([
            {
                text: 'Checkout',
                routerLink: [ ShopRouterLinks.checkout ],
                children: []
            }
        ])
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
