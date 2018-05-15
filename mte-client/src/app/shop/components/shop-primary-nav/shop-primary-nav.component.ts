import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { filter } from 'rxjs/operators/filter'

import { AppConfig } from '@mte/app-config'
import { NavigationBuilder } from '@mte/common/builders/navigation.builder'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { NavigationItem } from '@mte/common/models/api-models/navigation-item'
import { Organization } from '@mte/common/models/api-models/organization'
import { User } from '@mte/common/models/api-models/user'
import { BootstrapBreakpointKey } from '@mte/common/models/enums/bootstrap-breakpoint-key'
import { CartService } from '../../../shared/services/cart.service'
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
    @ViewChild('cart', { read: TemplateRef }) private cartTemplate: TemplateRef<{ discs: number | string, cartLength: number }>
    public cartTemplateContext = {
        count: 0,
        total: 0,
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
    public bootstrapBreakpointKey = BootstrapBreakpointKey

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
            this.cartTemplateContext.count = cart.count || 0
            this.cartTemplateContext.total = cart.total || 0
        })
    }

    public ngAfterViewInit(): void {
        if (this.router.events) {
            this.router.events
                .pipe(filter((event) => event instanceof NavigationStart))
                .subscribe(() => this.toggleFullScreenNav(false))
        }

        // Intentionally violating the one-way data flow rule.
        setTimeout(() => {
            this.rightNavigation = this.navigationBuilder.items([
                {
                    text: 'Cart',
                    template: this.cartTemplate,
                    context: this.cartTemplateContext,
                    routerLink: [ ShopRouterLinks.cart ],
                    children: [],
                    className: 'nav-item--cart',
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

    public getShoppingCartIcon(): string {
        const getIconSuffix = () => {
            if (this.cartTemplateContext) {
                return this.cartTemplateContext.count && this.cartTemplateContext.count < 4
                    ? this.cartTemplateContext.count
                    : !this.cartTemplateContext.count
                    ? 'empty'
                    : 'full'
            }
            else {
                return 'empty'
            }
        }

        if (this.organization && this.organization.globalStyles && this.organization.globalStyles.shoppingCartIcons) {
            return this.organization.globalStyles.shoppingCartIcons[getIconSuffix()]
        }
        else {
            return ''
        }

    }
}
