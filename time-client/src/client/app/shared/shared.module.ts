import { CommonModule } from '@angular/common'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'
import { TimeHttpModule } from '@time/common/http'

/**
 * EXTERNAL MODULES
 */
import { ClickOutsideModule } from 'ng-click-outside'
import { ToastrModule } from 'ngx-toastr'

/**
 * FEATURE MODULES
 */
import { FormFieldModule } from '@time/common/ng-modules/form-field'

/**
 * COMPONENTS
 */
import {
    ModalComponent,
    SiteLocatorComponent,
    TooltipComponent,
} from './components'

/**
 * DIRECTIVES
 */
import { FocusOnDirective } from './directives'

/**
 * PIPES
 */
import { TruncatePipe } from './pipes'

/**
 * SERVICES
 */
import {
    AuthGuardService,
    GAnalyticsService,
    HttpResponseInterceptor,
    RouteStateService,
    SeoService,
    UiService,
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
        TimeHttpModule.forRoot(),
        ClickOutsideModule,
        FormFieldModule,
    ],
    declarations: [
        SiteLocatorComponent,
        ModalComponent,
        FocusOnDirective,
        TruncatePipe,
        TooltipComponent,
    ],
    exports: [
        SiteLocatorComponent,
        ModalComponent,
        TooltipComponent,
        FocusOnDirective,
        ClickOutsideModule,
        TruncatePipe,
    ],
})

export class SharedModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                GAnalyticsService,
                AuthGuardService,
                SeoService,
                UtilService,
                UiService,
                RouteStateService,
                // {
                //     provide: HTTP_INTERCEPTORS,
                //     useClass: HttpResponseInterceptor,
                //     multi: true,
                // },
            ],
        }
    }
}
