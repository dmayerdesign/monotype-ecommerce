import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
// import { MyDatePickerModule } from 'mydatepicker'
import { NguiAutoCompleteModule } from '@ngui/auto-complete'

import { FormFieldComponent } from './form-field.component'
import { ValidationService } from './validation.service'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // MyDatePickerModule,
    NguiAutoCompleteModule,
  ],
  declarations: [
    FormFieldComponent,
  ],
  exports: [
    FormFieldComponent,
  ],
  providers: [
    ValidationService,
  ],
})
export class FormFieldModule { }
