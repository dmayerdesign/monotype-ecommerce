import { NgModule, ModuleWithProviders } from '@angular/core'
import { HttpModule } from '@angular/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

/**
 * EXTERNAL MODULES
 */
import { ToastrModule } from 'ngx-toastr'
import { ClickOutsideModule } from 'ng-click-outside'

/**
 * FEATURE MODULES
 */
import { FormFieldModule } from '@time/common/ng-modules/form-field'

/**
 * COMPONENTS
 */
import {
  SiteLocatorComponent,
  ModalComponent,
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
  GAnalyticsService,
  AuthGuardService,
  SeoService,
  UtilService,
  UiService,
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
      positionClass: "toast-top-center",
      maxOpened: 1,
      preventDuplicates: true,
    }),
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
      ],
    }
  }
}
