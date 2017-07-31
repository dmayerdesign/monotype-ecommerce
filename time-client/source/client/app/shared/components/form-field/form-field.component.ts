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
  ChangeDetectorRef,
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { IMyOptions, MyDatePicker } from 'mydatepicker';

import { UtilService } from '../../services';

@Component({
  selector: 'form-field',
  template: require('./form-field.component.html'),
})
export class FormFieldComponent implements OnInit, AfterViewInit, OnChanges {
  private value: any;
  private valid: boolean;
  private invalid: any[] = [];
  private showingValidation: string;
  private describedby: string;
  private tooltip: string;
  private pristine: boolean = true;
  private isDatepicker: boolean;
  private isTimeOfDay: boolean;
  private datePickerOptions: IMyOptions = {
    dateFormat: "mm/dd/yyyy",
    markCurrentDay: true,
  };
  private mdpNativeElement: ElementRef;
  private mdpInput: HTMLInputElement;
  private isAfterViewInit: boolean;
  private prefilled: boolean;
  private selectOptionDefault: {name: string; value?: any} = {name: '', value: undefined};

  @Input() isInput: boolean = true;
  @Input() isSelect: boolean;
  @Input() selectOptions: Array<{name: string; value?: any}>;
  @Input() selectOptionDefaultText: string;
  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() class: string = '';
  @Input() label: string = '';
  @Input() showLabel: boolean;
  @Input() labelClass: string = '';
  @Input() inputClass: string = '';
  @Input() name: string = '';
  @Input() placeholder: string;
  @Input() validators: Array<'required'|'email'|'date'|'password'|'confirmPassword'|'username'|'sanitary'|'zip'|'maxLength'|'interval'> = [];
  @Input() formSubmitted: boolean;
  @Input() twoColLeft: boolean;
  @Input() twoColRight: boolean;
  @Input() disablePast: boolean = true;
  @Input() confirm: string = '';
  @Input() interval: 'start'|'end';
  @Input() intervalStart: number;
  @Input() intervalEnd: number;
  @Input() textAlign: string = 'left';
  @Input() autoWidth: boolean;
  @Input() maxlength: number;
  @Input() disabled: boolean;
  @Input() labelFontSize: string;

  @Input() isAutocomplete: boolean;
  @Input() displayProperty: string;
  @Input() outputProperty: string;
  @Input() autocompleteSource: string;
  @Input() autocompleteFormatter: Function | string;

  @Output() modelChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() validate: EventEmitter<string[]> = new EventEmitter<string[]>();

  // @ViewChild('datePicker') private datePicker: MyDatePicker;
  
  constructor(
    private cd: ChangeDetectorRef,
    private util: UtilService,
  ) { }

  ngOnInit() {
    if (this.isSelect || this.isDatepicker || this.isAutocomplete) this.isInput = false;
    if (this.validators.indexOf("date") > -1) {
      this.maxlength = 10;
    } else {
      this.maxlength = 5000;
    }
    if (this.type === "datepicker") {
      let date = new Date();
      this.isInput = false;
      this.isDatepicker = true;
      if (this.disablePast) {
        this.datePickerOptions.disableUntil = {
          day: date.getDate() - 1,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        };
      }
    }
    if (this.type === 'timeOfDay') {
      this.isInput = false;
      this.isTimeOfDay = true;
      this.isSelect = true;
      this.selectOptions = this.util.getTimes();
    }
    if (this.isSelect) {
      this.selectOptionDefault.name = this.selectOptionDefaultText || 'Select ' + this.label.toLowerCase();
      if (!this.value) this.value = this.selectOptionDefault.value;
      // this.cd.detectChanges();
    }
    if (this.type === "textarea") this.isInput = false;
  }

  ngAfterViewInit() {
    this.isAfterViewInit = true;
  }

  ngOnChanges() {
    if (!this.prefilled) {
      this.prefilled = true;
      this.doValidation();
      this.validate.emit(this.invalid);
    }
    if (this.confirm || this.interval) {
      this.doValidation();
    }
  }

  @Input() get model(): any {
    return this.value;
  }

  set model(val: any) {
    this.onChange(val);
  }

  onChange(value: any) {
    this.value = value;

    // if (this.type === "datepicker" && this.isAfterViewInit) {
    //   this.updateDatepickerValue();
    // }

    this.modelChange.emit(this.value);
    this.doValidation();
    this.validate.emit(this.invalid);
  }

  onKeyup(event: KeyboardEvent) {
    if (this.validators.indexOf("date") === -1) return;
    if (event.keyCode === 8) {
      this.doValidation(true);
    } else {
      this.doValidation();
    }
  }

  doValidation(backspace?: boolean) {

    let emailPattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    let datePattern = new RegExp(/^(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/);
    let passwordPattern = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]/;
    let zipPattern = /^(([0-9]{5}$)|([0-9]{5}-[0-9]{4}$))/;
    let usernamePattern = /^\w+$/i;
    let sanitaryPattern = usernamePattern;

    this.invalid = [];
    
    if (this.validators.indexOf('required') > -1) {
      if (!this.value) {
        this.invalid.push("required");
      }
      else if (this.invalid.indexOf("required") > -1) {
        this.invalid.splice(this.invalid.indexOf("required"), 1);
      }
    }

    if (this.validators.indexOf('email') > -1) {
      if (this.value && !this.value.match(emailPattern)) {
        this.invalid.push("email");
      }
      else if (this.invalid.indexOf("email") > -1) {
        this.invalid.splice(this.invalid.indexOf("email"), 1);
      }
    }

    if (this.validators.indexOf('zip') > -1) {
      if (this.value && !this.value.match(zipPattern)) {
        this.invalid.push("zip");
      }
      else if (this.invalid.indexOf("zip") > -1) {
        this.invalid.splice(this.invalid.indexOf("zip"), 1);
      }
    }

    if (this.validators.indexOf('date') > -1) {
      // let dateStr: string = (this.type === 'date') ? this.value : (this.type === 'datepicker') ? (this.value && this.value.value) : '';
      if (this.type === 'date') {
        let dateStr = this.value;
        if (dateStr && !dateStr.match(datePattern)) {
          if (dateStr.length > 5 && dateStr.match(/^\d+$/)) {
            dateStr = dateStr.substr(0, 2) + '/' + dateStr.substr(2, 2) + '/' + dateStr.substr(4);
          }
          else if ((dateStr.length === 2 || dateStr.length === 5) && !backspace) {
            dateStr += '/';
          }
          else if ((dateStr.length === 3 || dateStr.length === 4) && dateStr.match(/^\d+$/)) {
            dateStr = dateStr.substr(0, 2) + '/' + dateStr.substr(2);
          }
          else {
            this.invalid.push("date");
          }
          
          if (this.type === 'date') {
            this.value = dateStr;
          }
          // else if (this.type === 'datepicker') {
          //   this.textValue = dateStr;
          // }
        }
        else if (this.invalid.indexOf("date") > -1) {
          this.invalid.splice(this.invalid.indexOf("date"), 1);
        }
      }
      if (this.type === 'datepicker') {
        if (this.value && ! this.value.valid) {
          this.invalid.push("date");
        }
        else if (this.invalid.indexOf("date") > -1) {
          this.invalid.splice(this.invalid.indexOf("date"), 1);
        }
      }
    }

    if (this.validators.indexOf('password') > -1) {
      if (!this.value || !this.value.match(passwordPattern) || this.value.length < 6) {
        this.invalid.push("password");
      } else if (this.invalid.indexOf("password") > -1) {
        this.invalid.splice(this.invalid.indexOf("password"), 1);
      }
    }

    if (this.validators.indexOf('confirmPassword') > -1) {
      if (!this.value || this.value !== this.confirm) {
        this.invalid.push("confirmPassword");
      } else if (this.invalid.indexOf("confirmPassword") > -1) {
        this.invalid.splice(this.invalid.indexOf("confirmPassword"), 1);
      }
    }

    if (this.validators.indexOf('interval') > -1) {
      if ((this.interval === "start" && this.intervalEnd < this.value) || (this.interval === "end" && this.intervalStart > this.value)) {
        this.invalid.push("interval");
      } else if (this.invalid.indexOf("interval") > -1) {
        this.invalid.splice(this.invalid.indexOf("interval"), 1);
      }
    }

    if (this.validators.indexOf('username') > -1) {
      if (this.value && !this.value.match(usernamePattern)) {
        this.invalid.push("username");
      } else if (this.invalid.indexOf("username") > -1) {
        this.invalid.splice(this.invalid.indexOf("username"), 1);
      }
    }

    if (this.validators.indexOf('sanitary') > -1) {
      if (this.value && !this.value.match(sanitaryPattern)) {
        this.invalid.push("sanitary");
      } else if (this.invalid.indexOf("sanitary") > -1) {
        this.invalid.splice(this.invalid.indexOf("sanitary"), 1);
      }
    }

    if (this.validators.indexOf('maxLength') > -1) {
      if (this.value && this.value.length > this.maxlength) {
        this.invalid.push("maxLength");
      } else if (this.invalid.indexOf("maxLength") > -1) {
        this.invalid.splice(this.invalid.indexOf("maxLength"), 1);
      }
    }

    this.setValidationVisible(this.invalid[0]);
  }

  onBlur(value?: any, mdpReason?: 1|2) {
    this.doValidation();
    if (this.value && this.type !== 'datepicker') this.pristine = false;
    if (this.value && this.value.value && this.type === 'datepicker' && mdpReason === 2) this.pristine = false;
  }

  setValidationVisible(validation?: 'required'|'email'|'date'|'password'|'confirmPassword'|'username'|'sanitary'|'zip'|'maxLength'|'interval') {
    if (validation) {
      this.showingValidation = validation;
      this.describedby = this.id + '-error';
    } else {
      this.showingValidation = null;
      this.describedby = '';
    }
  }

  trackByIndex(index: number, value: number) {
    return index;
  }

  // updateDatepickerValue() {
  //   this.mdpNativeElement = this.datePicker.elem.nativeElement;
  //   this.mdpInput = <HTMLInputElement>this.mdpNativeElement.querySelector("input");
  //   this.textValue = this.mdpInput.value;
  // }
}