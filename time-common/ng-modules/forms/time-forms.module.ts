import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { TimeFormControlComponent } from './form-control.component'
import { TimeInputComponent } from './input/input.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    TimeFormControlComponent,
    TimeInputComponent,
  ],
  exports: [
    TimeFormControlComponent,
    TimeInputComponent,
  ],
})
export class TimeFormsModule {}
