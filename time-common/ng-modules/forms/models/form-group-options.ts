import { TimeFormFieldOptions } from './form-field-options'

export interface TimeFormGroupOptions {
    [key: string]: TimeFormFieldOptions & {
        defaultValue?: string
        validators?: any[]
    }
}
