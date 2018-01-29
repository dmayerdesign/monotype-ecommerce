import { AbstractControl, FormControl } from '@angular/forms'

export interface TimeFormFieldOptions {
    label: string
    control?: FormControl | AbstractControl
    errorMessages?: { [errorType: string]: string }
}
