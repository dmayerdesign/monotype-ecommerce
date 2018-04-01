import { AbstractControl, FormControl } from '@angular/forms'

export interface MteFormFieldOptions {
    label: string
    control?: FormControl | AbstractControl
    errorMessages?: { [errorType: string]: string }
}
