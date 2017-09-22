import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

/**
 * EXTERNAL MODULES
 */
import { ClickOutsideModule } from 'ng-click-outside'
import { ToastrModule } from 'ngx-toastr'

/**
 * FEATURE MODULES
 */
import { TimeHttpModule } from '@time/common/http'
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
        ClickOutsideModule,
        FormFieldModule,
        TimeHttpModule.forRoot(),
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
            ],
        }
    }
}
