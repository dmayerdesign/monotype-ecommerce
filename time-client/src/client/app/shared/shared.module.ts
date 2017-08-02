import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * EXTERNAL MODULES
 */
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { NgUploaderModule } from 'ngx-uploader';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { ClickOutsideModule } from 'ng-click-outside';
import { MyDatePickerModule } from 'mydatepicker';

/**
 * COMPONENTS
 */
import {
  FormFieldComponent,
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
} from './services';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
  	FormsModule,
  	ReactiveFormsModule,
    ToastModule.forRoot(),
    NgUploaderModule,
    NguiAutoCompleteModule,
    ClickOutsideModule,
    MyDatePickerModule,
  ],
  declarations: [
    FormFieldComponent,
    SiteLocatorComponent,
    ModalComponent,
    FocusOnDirective,
    TruncatePipe,
    TooltipComponent,
  ],
  exports: [
    FormFieldComponent,
    SiteLocatorComponent,
    ModalComponent,
    TooltipComponent,
    FocusOnDirective,
    ClickOutsideModule,
    NgUploaderModule,
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
      ],
    }
  }
}
