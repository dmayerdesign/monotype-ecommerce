import * as mongoose from 'mongoose'

export type Func = (...args: any[]) => any
export type RequiredType = boolean | [boolean, string] | string | Func | [Func, string]
export type PropType = 'array' | 'object'

export interface BasePropOptions {
    required?: RequiredType
    enum?: string[] | object
    get?: (value?: any) => any
    default?: any
    unique?: boolean
    index?: boolean
    type?: string | Function | Object | mongoose.Schema.Types.ObjectId
}

export interface MongooseDocument extends mongoose.Document {
    _id: string
    createdAt?: any
    updatedAt?: any
}

export interface PropOptions extends BasePropOptions {
    ref?: any
}

export interface ArrayPropOptions extends BasePropOptions {
    items?: any
    itemsRef?: any
}

export interface SchemaTypeOptions extends PropOptions {
    type?: string | Function | Object | mongoose.Schema.Types.ObjectId
}

export interface ValidateNumberOptions {
    min?: number | [number, string]
    max?: number | [number, string]
}

export interface ValidateStringOptions {
    minlength?: number | [number, string]
    maxlength?: number | [number, string]
    match?: RegExp | [RegExp, string]
}
