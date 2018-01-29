import { FormBuilder, FormGroup } from '@angular/forms'

import { TimeFormFieldOptions } from '../models/form-field-options'
import { TimeFormGroupOptions } from '../models/form-group-options'

export class TimeFormBuilder {
    public _formGroup: FormGroup

    constructor(private formBuilder: FormBuilder, private options: TimeFormGroupOptions) {
        this.init()
    }

    private init(): void {
        if (!this._formGroup) {
            const formGroupOptions = {}

            for (const option in this.options) {
                const defaultValue = this.options[option].defaultValue || ''
                const validators = this.options[option].validators || []
                formGroupOptions[option] = [ defaultValue, validators ]
            }

            this._formGroup = this.formBuilder.group(formGroupOptions)
        }
    }

    public getOptions(field: string): TimeFormFieldOptions {
        return {
            label: this.options[field].label,
            control: this._formGroup.get(field),
            errorMessages: this.options[field].errorMessages
        }
    }

    public get formGroup(): FormGroup {
        return this._formGroup
    }
}
