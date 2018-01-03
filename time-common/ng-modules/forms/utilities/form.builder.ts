import { FormBuilder, FormGroup } from '@angular/forms'

import { ITimeFormFieldOptions } from '../models/form-field-options'
import { ITimeFormGroupOptions } from '../models/form-group-options'

export class TimeFormBuilder {
    public _formGroup: FormGroup

    constructor(private formBuilder: FormBuilder, private options: ITimeFormGroupOptions) {
        this.init()
    }

    private init(): void {
        if (!this._formGroup) {
            const formGroupOptions = {}

            for (const option in this.options) {
                formGroupOptions[option] = [ this.options[option].defaultValue, ...this.options[option].validators ]
            }

            this._formGroup = this.formBuilder.group(formGroupOptions)
        }
    }

    public getOptions(field: string): ITimeFormFieldOptions {
        return {
            label: this.options[field].label,
            showLabel: this.options[field].showLabel,
            control: this._formGroup.get(field),
            errorMessages: this.options[field].errorMessages
        }
    }

    public get formGroup(): FormGroup {
        return this._formGroup
    }
}
