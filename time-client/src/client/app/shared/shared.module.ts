import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * EXTERNAL MODULES
 */
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { ClickOutsideModule } from 'ng-click-outside';

/**
 * FEATURE MODULES
 */
import { FormFieldModule } from './modules/form-field'

/**
 * COMPONENTS
 */
import {
  SiteLocatorComponent,
  ModalComponent,
  TooltipComponent,
} from './components';

/**
 * DIRECTIVES
 */
import { FocusOnDirective } from './directives';

/**
 * PIPES
 */
import { TruncatePipe } from './pipes';

/**
 * SERVICES
 */
import {
  GAService,
  AuthGuardService,
  SEOService,
  UtilService,
  UIService,
} from './services';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
  	FormsModule,
    ReactiveFormsModule,
    FormFieldModule,
    ToastModule.forRoot(),
    NguiAutoCompleteModule,
    ClickOutsideModule,
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
        GAService,
        AuthGuardService,
        SEOService,
        UtilService,
        UIService,
      ],
    }
  }
}
