import { Injectable } from '@angular/core'
import { FormBuilder } from '@angular/forms'

import { TimeFormGroupOptions } from '../models/form-group-options'
import { TimeFormBuilder } from '../utilities/form.builder'

@Injectable()
export class TimeFormBuilderService {
    constructor(public formBuilder: FormBuilder) {}

    public create(options: TimeFormGroupOptions): TimeFormBuilder {
        const timeFormBuilder = new TimeFormBuilder(this.formBuilder, options)

        return timeFormBuilder
    }
}
