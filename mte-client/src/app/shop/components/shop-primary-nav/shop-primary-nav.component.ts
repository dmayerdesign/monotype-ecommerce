import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { AppConfig } from '@mte/app-config'
import { NavigationItem } from '@mte/common/api/interfaces/navigation-item'
import { Organization } from '@mte/common/api/interfaces/organization'
import { User } from '@mte/common/api/interfaces/user'
import { NavigationBuilder } from '@mte/common/builders/navigation.builder'
import { BootstrapBreakpointKey } from '@mte/common/constants/enums/bootstrap-breakpoint-key'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { Store } from '@ngrx/store'
import { filter } from 'rxjs/operators'
import { cartSelectorKey } from '../../../cart/cart.selectors'
import { CartService } from '../../../cart/cart.service'
import { OrganizationService } from '../../../services/organization.service'
import { UserService } from '../../../services/user.service'
import { AppState } from '../../../state/app.state'
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
        private _store: Store<AppState>,
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
        this._store.select(cartSelectorKey).subscribe((cart) => {
            this.cartTemplateContext.count = cart.count || 0
            this.cartTemplateContext.total = !!cart.total ? (cart.total.amount || 0) : 0
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

        if (
            this.organization &&
            this.organization.globalStyles &&
            this.organization.globalStyles.shoppingCartIcons
        ) {
            return this.organization.globalStyles.shoppingCartIcons[getIconSuffix()]
        }
        else {
            return ''
        }

    }
}
