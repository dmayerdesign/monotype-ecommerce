import { ModuleWithProviders, NgModule } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

// FEATURE MODULES
import { TimeFormsModule } from '@time/common/ng-modules/forms'
import { TimeHttpModule } from '@time/common/ng-modules/http'
import { TimeUiModule } from '@time/common/ng-modules/ui'

// COMPONENTS
import { LoginComponent } from './components/login/login.component'
import { SiteLocatorComponent } from './components/site-locator/site-locator.component'

// SERVICES
import {
    AuthGuardService,
    CartService,
    GAnalyticsService,
    OrganizationService,
    RouteStateService,
    SeoService,
    UiService,
    UserService,
    UtilService,
} from './services'

@NgModule({
    imports: [
        BrowserAnimationsModule,
        TimeHttpModule.forRoot(),
        TimeUiModule,
        TimeFormsModule,
    ],
    declarations: [
        SiteLocatorComponent,
        LoginComponent,
    ],
    exports: [
        TimeFormsModule,
        TimeHttpModule,
        TimeUiModule,
        SiteLocatorComponent,
        LoginComponent,
    ],
})
export class SharedModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                AuthGuardService,
                CartService,
                GAnalyticsService,
                OrganizationService,
                RouteStateService,
                SeoService,
                UiService,
                UserService,
                UtilService,
            ],
        }
    }
}
