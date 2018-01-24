import { ITimeFormFieldOptions } from './form-field-options'

export interface ITimeFormGroupOptions {
    [key: string]: ITimeFormFieldOptions & {
        defaultValue?: string
        validators?: any[]
    }
}
