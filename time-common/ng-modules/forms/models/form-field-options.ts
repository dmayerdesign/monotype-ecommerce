import { AbstractControl, FormControl } from '@angular/forms'

export interface ITimeFormFieldOptions {
    label: string
    control?: FormControl | AbstractControl
    errorMessages?: { [errorType: string]: string }
}
