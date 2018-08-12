import { Injectable } from '@angular/core'
import { FormBuilder } from '@angular/forms'

import { MteFormGroupOptions } from '../models/form-group-options'
import { MteFormBuilder } from '../utilities/form.builder'

@Injectable()
export class MteFormBuilderService {
    constructor(public formBuilder: FormBuilder) { }

    public create(options: MteFormGroupOptions): MteFormBuilder {
        const mteFormBuilder = new MteFormBuilder(this.formBuilder, options)

        return mteFormBuilder
    }
}
