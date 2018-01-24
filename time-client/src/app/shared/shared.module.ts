import { ModuleWithProviders, NgModule } from '@angular/core'

// Settings.
import { HttpSettings } from './config/http.settings'

// Feature modules.
import { TimeFormsModule } from '@time/common/ng-modules/forms'
import { HttpInjectionTokens, TimeHttpModule } from '@time/common/ng-modules/http'
import { TimeUiModule } from '@time/common/ng-modules/ui'

// Components.
import { LoginComponent } from './components/login/login.component'
import { SignupComponent } from './components/signup/signup.component'
import { SiteLocatorComponent } from './components/site-locator/site-locator.component'

// Services.
import { ProductService } from '../shop/services/index'
import { AdminGuardService } from './services/admin-guard.service'
import { AuthGuardService } from './services/auth-guard.service'
import { CartService } from './services/cart.service'
import { GAnalyticsService } from './services/ga.service'
import { OrganizationService } from './services/organization.service'
import { RouteStateService } from './services/route-state.service'
import { SeoService } from './services/seo.service'
import { UiService } from './services/ui.service'
import { UserService } from './services/user.service'
import { UtilService } from './services/util.service'

@NgModule({
    imports: [
        TimeFormsModule,
        TimeHttpModule.forRoot(),
        TimeUiModule,
    ],
    declarations: [
        SiteLocatorComponent,
        LoginComponent,
        SignupComponent,
    ],
    exports: [
        TimeFormsModule,
        TimeHttpModule,
        TimeUiModule,
        SiteLocatorComponent,
        LoginComponent,
        SignupComponent,
    ],
})
export class SharedModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                AdminGuardService,
                AuthGuardService,
                CartService,
                GAnalyticsService,
                OrganizationService,
                ProductService,
                RouteStateService,
                SeoService,
                UiService,
                UserService,
                UtilService,
                {
                    provide: HttpInjectionTokens.HttpSettings,
                    useValue: HttpSettings,
                },
            ],
        }
    }

    public static forChild(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
        }
    }
}
