import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { TimeFormFieldComponent } from './components/form-field/form-field.component'
import { TimeFormBuilderService } from './services/form-builder.service'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    TimeFormFieldComponent,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    TimeFormFieldComponent,
  ],
  providers: [
    TimeFormBuilderService
  ]
})
export class TimeFormsModule {}
