import { Injectable } from '@angular/core'
import { FormBuilder } from '@angular/forms'

import { ITimeFormGroupOptions } from '../models/form-group-options'
import { TimeFormBuilder } from '../utilities/form.builder'

@Injectable()
export class TimeFormBuilderService {
    constructor(public formBuilder: FormBuilder) {}

    public create(options: ITimeFormGroupOptions): TimeFormBuilder {
        const timeFormBuilder = new TimeFormBuilder(this.formBuilder, options)

        return timeFormBuilder
    }
}
