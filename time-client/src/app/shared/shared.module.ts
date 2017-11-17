import { CommonModule } from '@angular/common'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

/*
 * EXTERNAL MODULES
 */
import { ClickOutsideModule } from 'ng-click-outside'
import { ToastrModule } from 'ngx-toastr'

/*
 * FEATURE MODULES
 */
import { TimeFormsModule } from '@time/common/ng-modules/forms'
import { TimeHttpModule } from '@time/common/ng-modules/http'
import { TimeUiModule } from '@time/common/ng-modules/ui'

/*
 * COMPONENTS
 */
import { LoginComponent } from './components/login/login.component'
import { SiteLocatorComponent } from './components/site-locator/site-locator.component'

/*
 * SERVICES
 */
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
        CommonModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            timeOut: 6000,
            positionClass: 'toast-top-center',
            maxOpened: 1,
            preventDuplicates: true,
        }),
        ClickOutsideModule,
        TimeHttpModule.forRoot(),
        TimeUiModule,
        TimeFormsModule,
    ],
    declarations: [
        SiteLocatorComponent,
        LoginComponent,
    ],
    exports: [
        CommonModule,
        SiteLocatorComponent,
        ClickOutsideModule,
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
