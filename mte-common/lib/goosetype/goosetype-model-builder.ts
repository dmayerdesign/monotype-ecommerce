import { injectable } from 'inversify'
import { camelCase } from 'lodash'
import * as mongoose from 'mongoose'

// Errors.

export class InvalidArrayPropOptionsError extends Error { }
export class SchemaNotDefinedError extends Error { }

// Schema options.

export class MongooseSchemaOptions {
    public static readonly timestamped = { timestamps: true }
}

// Types.

export type Func = (...args: any[]) => any

export type RequiredType = boolean | [boolean, string] | string | Func | [Func, string]

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

export interface MongooseModel<T = any> extends mongoose.Model<T & (MongooseDocument | mongoose.Document)> {
    findOrCreate: (query: object) => Promise<{ doc: T; created: boolean }>
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

export interface PropTypeArgs {
    options: PropOptions & ArrayPropOptions
    propType: PropType
    key: string
    target: MongooseModel<any>
}

export type PropType = 'array' | 'object'
export type PropOptionsWithNumberValidate = PropOptions & ValidateNumberOptions
export type PropOptionsWithStringValidate = PropOptions & ValidateStringOptions
export type PropOptionsWithValidate = PropOptionsWithNumberValidate | PropOptionsWithStringValidate
export type Ref<T> = T | string

// Model builder.

// Create a singleton.
let modelBuilder: ModelBuilder

export class ModelBuilder {
    public schemaDefinitions: any = {}
    public schemas: { [key: string]: mongoose.Schema } = {}
    public preMiddleware: any = {}
    public postMiddleware: any = {}
    public plugins: any = {}

    constructor() {
        if (!modelBuilder) {
            modelBuilder = this
        }
        return modelBuilder
    }

    public addTo(which: string, constructorName: string, value: any): void {
        let definition = this[which][camelCase(constructorName)]
        if (!definition) {
            definition = []
        }
        definition.push(value)
        this[which][camelCase(constructorName)] = definition
    }

    public isValidPrimitiveOrObject(type): boolean {
        return (
            type === String ||
            type === Number ||
            type === Boolean ||
            type === Object ||
            type === Buffer
        )
    }

    public getTypeOrSchema(type: any, options?: mongoose.SchemaOptions): object {
        if (this.isValidPrimitiveOrObject(type)) {
            if (type === Object) {
                return mongoose.Schema.Types.Mixed
            }
            if (type === Buffer) {
                return mongoose.Schema.Types.Buffer
            }
            return type
        }
        else {
            if (type === mongoose.Schema.Types.ObjectId) {
                return mongoose.Schema.Types.ObjectId
            }
            if (!this.schemas[camelCase(type.name)]) {
                this.schemas[camelCase(type.name)] = new mongoose.Schema()
                // throw new SchemaNotDefinedError(`A schema associated with ${type.name} has not been defined. Make sure the class extends MongooseDocument.`)
            }

            return this.schemas[camelCase(type.name)]
        }
    }

    public baseProp(propTypeArgs: PropTypeArgs) {
        const { target, key, propType, options } = propTypeArgs
        let schema: mongoose.SchemaDefinition = this.schemaDefinitions[camelCase((target.constructor as any).name)]
        let schemaProperty: mongoose.SchemaTypeOpts<any> = {}
        let type

        const nonPropertyOptions = [
            'items',
            'itemsRef'
        ]

        if (!schema) {
            schema = this.schemaDefinitions[camelCase((target.constructor as any).name)] = {}
        }

        // Might need a second glance.
        if (options) {
            Object.keys(options)
                .filter((option) => nonPropertyOptions.indexOf(option) === -1)
                .forEach((option) => {
                    if (option === 'enum') {
                        const theEnum = options[option]
                        let enumArr: string[] = []
                        let enumKeys: string[]
                        if (Array.isArray(theEnum)) {
                            enumArr = theEnum as string[]
                        }
                        // If the enum value is not an array, assume it's an actual `enum`.
                        else {
                            enumKeys = Object.keys(theEnum)
                            enumArr = !isNaN(parseInt(enumKeys[0], 10))
                                ? enumKeys.slice(0, enumKeys.length / 2)
                                : enumKeys.map((enumKey) => theEnum[enumKey])
                        }
                        schemaProperty.enum = enumArr
                    }
                    else {
                        schemaProperty[option] = options[option]
                    }
                })
        }

        if (propType === 'array') {
            if (!options.items && !options.itemsRef) {
                throw new InvalidArrayPropOptionsError('You must define items or itemsRef.')
            }

            if (options.items) {
                schemaProperty = [ this.getTypeOrSchema(options.items) ]
            }
            else if (options.itemsRef) {
                schemaProperty = [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: options.itemsRef.name,
                }]
            }
        }
        else {
            type = Reflect.getMetadata('design:type', target, key)

            if (options) {
                if (options.type) {
                    type = options.type
                }
                if (options.ref) {
                    type = mongoose.Schema.Types.ObjectId
                }
            }

            schemaProperty.type = this.getTypeOrSchema(type)
        }

        schema[key] = schemaProperty
    }
}
