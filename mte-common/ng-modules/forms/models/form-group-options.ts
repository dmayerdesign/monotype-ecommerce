import { MteFormFieldOptions } from './form-field-options'

export interface MteFormGroupOptions {
    [key: string]: MteFormFieldOptions & {
        defaultValue?: string
        validators?: any[]
    }
}
