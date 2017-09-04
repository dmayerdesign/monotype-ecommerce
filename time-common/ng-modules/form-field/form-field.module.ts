import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { FormFieldComponent } from './form-field.component'
import { ValidationService } from './validation.service'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
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
export class FormFieldModule {}
