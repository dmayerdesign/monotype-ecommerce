import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  forwardRef,
} from '@angular/core'
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR, 
  NG_VALIDATORS, 
  FormControl, 
  Validator 
} from '@angular/forms'
// import { IMyOptions, MyDatePicker } from 'mydatepicker'

import { FormFieldUtils } from './form-field.utils'
import { ValidationService } from './validation.service'

type InputField = 'text'
type DatePickerField = 'datePicker'
type AutoCompleteField = 'autoComplete'
type SelectField = 'select'|'timeOfDay'
type TextAreaField = 'textarea'
type FormFieldValidator = 'required'|'email'|'date'|'password'|'confirmPassword'|'username'|'sanitary'|'zip'|'maxLength'|'interval'

@Component({
  selector: 'form-field',
  templateUrl: './form-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true,
    }  
  ],
})
export class FormFieldComponent implements OnInit, ControlValueAccessor, Validator {
  value: any
  valid: boolean
  invalid: any[] = []
  showingValidation: string
  describedby: string
  tooltip: string
  pristine: boolean = true
  isDatePicker: boolean
  isTimeOfDay: boolean
  // datePickerOptions: IMyOptions = {
  //   dateFormat: "mm/dd/yyyy",
  //   markCurrentDay: true,
  // }
  mdpNativeElement: ElementRef
  mdpInput: HTMLInputElement
  prefilled: boolean
  selectOptionDefault: {name: string; value?: any} = {name: '', value: undefined}

  @Input() type: InputField | SelectField | TextAreaField | AutoCompleteField | DatePickerField
  @Input() selectOptions: Array<{name: string; value?: any}>
  @Input() selectOptionDefaultText: string
  @Input() id: string = ''
  @Input() class: string = ''
  @Input() label: string = ''
  @Input() showLabel: boolean
  @Input() labelClass: string = ''
  @Input() inputClass: string = ''
  @Input() name: string = ''
  @Input() placeholder: string
  @Input() validators: Array<FormFieldValidator> = []
  @Input() formSubmitted: boolean
  @Input() twoColLeft: boolean
  @Input() twoColRight: boolean
  @Input() disablePast: boolean = true
  @Input() confirm: string = ''
  @Input() interval: 'start'|'end'
  @Input() intervalStart: number
  @Input() intervalEnd: number
  @Input() textAlign: string = 'left'
  @Input() autoWidth: boolean
  @Input() maxlength: number
  @Input() disabled: boolean
  @Input() labelFontSize: string

  @Input() displayProperty: string
  @Input() outputProperty: string
  @Input() autocompleteSource: string
  @Input() autocompleteFormatter: Function | string

  @Output() modelChange: EventEmitter<string> = new EventEmitter<string>()
  @Output() validationChange: EventEmitter<string[]> = new EventEmitter<string[]>()

  // ControlValueAccessor implementation
  // ====================================
  private propagateChange = (_: any) => { }
  private propagateTouch = (_: any) => { }
  public writeValue(val: any) {
    this.value = val
    this.doValidation()
    this.validationChange.emit(this.invalid)
  }
  public registerOnChange(fn: (_: any) => void): void { this.propagateChange = fn }
  public registerOnTouched(fn: () => void): void { this.propagateTouch = fn }
  // ====================================
  // END ControlValueAccessor implementation
  
  constructor(
    private util: FormFieldUtils,
    private validationService: ValidationService,
  ) { }

  ngOnInit() {
    if (this.validators.indexOf("date") > -1) {
      this.maxlength = 10
    } else {
      this.maxlength = 5000
    }
    if (this.type === "datePicker") {
      let date = new Date()
      if (this.disablePast) {
        // this.datePickerOptions.disableUntil = {
        //   day: date.getDate() - 1,
        //   month: date.getMonth() + 1,
        //   year: date.getFullYear(),
        // }
      }
    }
    if (this.type === 'timeOfDay') {
      this.selectOptions = this.util.getTimes()
    }
    if (this.type === "select" || this.type === "timeOfDay") {
      this.selectOptionDefault.name = this.selectOptionDefaultText || 'Select ' + this.label.toLowerCase()
      if (!this.value) {
        this.value = this.selectOptionDefault.value
      }
    }
  }

  @Input() get model(): any {
    return this.value
  }
  set model(val: any) {
    this.onChange(val)
  }

  onChange(value: any) {
    this.value = value
    this.propagateChange(this.value)
    this.doValidation()
    this.validationChange.emit(this.invalid)
  }

  onKeyup(event: KeyboardEvent) {
    if (this.validators.indexOf("date") === -1) return
    this.doValidation(event)
  }

  validate(c: FormControl) {
      let validationObj: any = {}
      this.doValidation()
      this.invalid.forEach(invalid => {
        validationObj[invalid + "Error"] = {
          valid: false,
        }
      })
      return validationObj
  }

  doValidation(event?: KeyboardEvent) {
    this.invalid = this.validationService.validate(this.value, event, this.type, this.validators, {
      confirm: this.confirm,
      maxlength: this.maxlength,
      interval: this.interval,
      intervalStart: this.intervalStart,
      intervalEnd: this.intervalEnd,
    })

    this.setValidationVisible(this.invalid[0])
  }

  onBlur(value?: any, mdpReason?: 1|2) {
    this.doValidation()
    if (this.value && this.type !== 'datePicker') this.pristine = false
    if (this.value && this.value.value && this.type === 'datePicker' && mdpReason === 2) this.pristine = false
  }

  setValidationVisible(validation?: FormFieldValidator) {
    if (validation) {
      this.showingValidation = validation
      this.describedby = this.id + '-error'
    } else {
      this.showingValidation = null
      this.describedby = ''
    }
  }

  trackByIndex(index: number, value: number) {
    return index
  }
}