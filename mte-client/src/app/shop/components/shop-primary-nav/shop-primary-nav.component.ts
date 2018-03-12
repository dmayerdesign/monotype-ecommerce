import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'

import { AppConfig } from '@mte/app-config'
import { NavigationBuilder } from '@mte/common/builders/navigation.builder'
import { NavigationItem } from '@mte/common/models/api-models/navigation-item'
import { Organization } from '@mte/common/models/api-models/organization'
import { User } from '@mte/common/models/api-models/user'
import { WindowRefService } from '@mte/common/ng-modules/ui/services/window-ref.service'
import { CartService } from '../../../shared/services'
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
    @ViewChild('basket', { read: TemplateRef }) private basketTemplate: TemplateRef<{ discs: number | string, cartLength: number }>
    public basketTemplateContext = {
        discs: this.getBasketImageId(),
        cartLength: 0,
    }
    public user: User
    public organization: Organization
    public routerLinks = ShopRouterLinks
    public navbarId = 'navbar-nav'
    public fullScreenNavIsExpanded = false
    public leftNavigation: NavigationItem[] = []
    public rightNavigation: NavigationItem[] = []
    private navigationBuilder = new NavigationBuilder()
    public appConfig = AppConfig

    constructor(
        public userService: UserService,
        public organizationService: OrganizationService,
        public windowRefService: WindowRefService,
        public cartService: CartService,
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
        this.cartService.carts.subscribe((cart) => {
            this.basketTemplateContext.cartLength = cart.items ? cart.items.length : 0
            this.basketTemplateContext.discs = this.getBasketImageId()
        })
    }

    public ngAfterViewInit(): void {
        if (this.router.events && typeof this.router.events.filter === 'function') {
            this.router.events
                .filter((event) => event instanceof NavigationStart)
                .subscribe(() => this.toggleFullScreenNav(false))
        }

        // Intentionally violating the one-way data flow rule.
        setTimeout(() => {
            this.rightNavigation = this.navigationBuilder.items([
                {
                    text: 'Cart',
                    template: this.basketTemplate,
                    context: this.basketTemplateContext,
                    routerLink: [ ShopRouterLinks.cart ],
                    children: []
                },
            ])
        })
    }

    public toggleFullScreenNav(shouldShow?: boolean): void {
        if (typeof shouldShow !== 'undefined') {
            this.fullScreenNavIsExpanded = shouldShow
        }
        else {
            this.fullScreenNavIsExpanded = !this.fullScreenNavIsExpanded
        }
    }

    public getBasketImageId(): string | number {
        if (this.basketTemplateContext) {
            return this.basketTemplateContext.cartLength && this.basketTemplateContext.cartLength < 4
                ? this.basketTemplateContext.cartLength
                : !this.basketTemplateContext.cartLength
                ? 'empty'
                : 4
        }
        else {
            return 'empty'
        }
    }
}
