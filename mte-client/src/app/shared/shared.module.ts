import { ModuleWithProviders, NgModule } from '@angular/core'

// Settings.
import { HttpSettings } from './config/http.settings'

// Feature modules.
import { MteFormsModule } from '@mte/common/lib/ng-modules/forms'
import { HttpInjectionTokens, MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteUiModule } from '@mte/common/lib/ng-modules/ui'

// Components.
import { LoginComponent } from './components/login/login.component'
import { SignupComponent } from './components/signup/signup.component'
import { SiteLocatorComponent } from './components/site-locator/site-locator.component'

// Services.
import { ProductService } from '../shop/services/product.service'
import { TaxonomyTermService } from '../shop/services/taxonomy-term.service'
import { AdminGuardService } from './services/admin-guard.service'
import { AuthGuardService } from './services/auth-guard.service'
import { GAnalyticsService } from './services/ga.service'
import { OrganizationService } from './services/organization.service'
import { RouteStateService } from './services/route-state.service'
import { SeoService } from './services/seo.service'
import { UiService } from './services/ui.service'
import { UserService } from './services/user.service'
import { UtilService } from './services/util.service'

@NgModule({
    imports: [
        MteFormsModule,
        MteHttpModule.forRoot(),
        MteUiModule.forRoot(),
    ],
    declarations: [
        SiteLocatorComponent,
        LoginComponent,
        SignupComponent,
    ],
    exports: [
        MteFormsModule,
        MteHttpModule,
        MteUiModule,
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
                GAnalyticsService,
                OrganizationService,
                ProductService,
                TaxonomyTermService,
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
