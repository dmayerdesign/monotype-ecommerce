import { AbstractControl, FormControl } from '@angular/forms'

export interface ITimeFormFieldOptions {
    label: string
    showLabel?: boolean
    control?: FormControl | AbstractControl
    errorMessages?: { [errorType: string]: string }
}
