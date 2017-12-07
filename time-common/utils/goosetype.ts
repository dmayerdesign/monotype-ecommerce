import { injectable } from 'inversify'
import * as mongoose from 'mongoose'
import * as findOrCreate from 'mongoose-findorcreate'
import 'reflect-metadata'

import { container } from '../../time-api/config/inversify.config'
import { Types } from '../constants/inversify/types'

const modelBuilder = container.get<ModelBuilder>(Types.ModelBuilder)

// Types

export type Func = (...args: any[]) => any

export type RequiredType = boolean | [boolean, string] | string | Func | [Func, string]

export interface BasePropOptions {
    required?: RequiredType
    enum?: string[] | object
    default?: any
    unique?: boolean
    index?: boolean
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
    target: Model<any>
}

export type PropType = 'array' | 'object'
export type PropOptionsWithNumberValidate = PropOptions & ValidateNumberOptions
export type PropOptionsWithStringValidate = PropOptions & ValidateStringOptions
export type PropOptionsWithValidate = PropOptionsWithNumberValidate | PropOptionsWithStringValidate
export type Ref<T> = T | string

// Model builder

@injectable()
export class ModelBuilder {
    public schemaDefinitions: any = {}
    public preMiddleware: any = {}
    public postMiddleware: any = {}
    public plugins: any = {}

    public get find() {
        const that = this
        return {
            schemaDefinition(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.schemaDefinitions[name]) {
                    return that.schemaDefinitions[name]
                }
                else {
                    return null
                }
            },
            preMiddleware(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.preMiddleware[name]) {
                    return that.preMiddleware[name]
                }
                else {
                    return null
                }
            },
            postMiddleware(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.postMiddleware[name]) {
                    return that.postMiddleware[name]
                }
                else {
                    return null
                }
            },
            plugin(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.plugins[name]) {
                    return that.plugins[name]
                }
                else {
                    return null
                }
            }
        }
    }

    public get findOrCreate() {
        const that = this
        return {
            schemaDefinition(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.find.schemaDefinition(name)) {
                    return that.find.schemaDefinition(name)
                }
                else {
                    that.schemaDefinitions[name] = {}
                }
            },
            preMiddleware(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.find.preMiddleware(name)) {
                    return that.find.preMiddleware(name)
                }
                else {
                    that.preMiddleware[name] = []
                }
            },
            postMiddleware(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.find.postMiddleware(name)) {
                    return that.find.postMiddleware(name)
                }
                else {
                    that.postMiddleware[name] = []
                }
            },
            plugin(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.find.plugin(name)) {
                    return that.find.plugin(name)
                }
                else {
                    that.plugins[name] = []
                }
            }
        }
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

    // public schema(schemaOptions?: mongoose.SchemaOptions): ClassDecorator {
    //     return (constructor: any) => {
    //         this.schemas[constructor.name] = new constructor().getSchema(schemaOptions)
    //     }
    // }

    public pre(...args): ClassDecorator {
        return (constructor: any) => {
            this.findOrCreate.preMiddleware(constructor.name)
        }
    }

    public post(...args): ClassDecorator {
        return (constructor: any) => {
            this.findOrCreate.postMiddleware(constructor.name)
        }
    }

    public plugin(...args): ClassDecorator {
        return (constructor: any) => {
            this.findOrCreate.plugin(constructor.name)
        }
    }

    public getTypeOrSchema(type: any): object {
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
            if (!this.schemaDefinitions[type.name]) {
                throw new SchemaNotDefinedError('A schema associated with this class has not been defined. Make sure a `@schema()` decorator exists on the class.')
            }
            return this.schemaDefinitions[type.name]
        }
    }

    public baseProp(propTypeArgs: PropTypeArgs) {
        const { target, key, propType, options } = propTypeArgs
        let schema: mongoose.SchemaDefinition = this.findOrCreate.schemaDefinition((target.constructor as any).name)
        const schemaProperty: mongoose.SchemaTypeOpts<any> | mongoose.Schema | mongoose.SchemaType = {}

        const nonPropertyOptions = [
            'items',
            'itemsRef'
        ]

        if (!schema) {
            schema = {}
        }

        // Might need a second glance
        for (const option in options) {
            if (options.hasOwnProperty(option) && nonPropertyOptions.indexOf(option) === -1) {
                schemaProperty[option] = options[option]
            }
        }

        if (propType === 'array') {
            schema[key] = [schemaProperty]

            if (!options.items && !options.itemsRef) {
                throw new InvalidArrayPropOptionsError('You must define items or itemsRef.')
            }

            if (options.items) {
                schemaProperty.type = this.getTypeOrSchema(options.items)
            }
            else if (options.itemsRef) {
                schemaProperty.type = mongoose.Schema.Types.ObjectId
                schemaProperty.ref = options.itemsRef.name
            }
        }
        else {
            schema[key] = schemaProperty

            let type = Reflect.getMetadata("design:type", target, key)

            if (options && (options as SchemaTypeOptions).type) {
                type = (options as SchemaTypeOptions).type
            }

            schemaProperty.type = this.getTypeOrSchema(type)
        }
    }
    public prop(options: PropOptions) {
        return (target: any, key: string) => {
            this.baseProp({ propType: 'object', target, key, options })
        }
    }
    public arrayProp(options: ArrayPropOptions) {
        return (target: any, key: string) => {
            this.baseProp({ propType: 'array', target, key, options })
        }
    }
}

// Utilities

export function composeSchemaForInstance(target: Schema, schemaOptions?: mongoose.SchemaOptions) {
    const __modelBuilder = container.get<ModelBuilder>(Types.ModelBuilder)
    const schemaDefinition = __modelBuilder.find.schemaDefinition((target.constructor as any).name)
    const preMiddleware = __modelBuilder.find.preMiddleware((target.constructor as any).name)
    const postMiddleware = __modelBuilder.find.postMiddleware((target.constructor as any).name)
    const plugins = __modelBuilder.find.plugin((target.constructor as any).name)

    const schema = new mongoose.Schema(schemaDefinition, schemaOptions)

    if (preMiddleware) {
        preMiddleware.forEach((preHookArgs) => {
            if (preHookArgs.length > 1) {
                (schema.pre as any)(...preHookArgs)
            }
            else {
                throw new Error(`Invalid number of preMiddleware arguments: got ${preHookArgs.length}, expected between 2 and 3`)
            }
        })
    }

    if (postMiddleware) {
        postMiddleware.post.forEach((postHookArgs) => {
            if (postHookArgs.length > 1) {
                (schema.post as any)(...postHookArgs)
            }
            else {
                throw new Error(`Invalid number of preMiddleware arguments: got ${postHookArgs.length}, expected between 2 and 3`)
            }
        })
    }

    if (plugins) {
        plugins.forEach((plugin) => {
            schema.plugin(plugin[0] as (schema: mongoose.Schema, options?: Object) => void, plugin[1] as Object)
        })
    }

    return schema
}

export function composeModelForInstance(target: Model<any>, schemaOptions?: mongoose.SchemaOptions) {
    const schema = composeSchemaForInstance(target, schemaOptions)
    return mongoose.model((target.constructor as any).name, schema)
}

// Decorators

export const prop: (options?: PropOptions) => PropertyDecorator = modelBuilder.prop.bind(modelBuilder)
export const arrayProp: (options?: ArrayPropOptions) => PropertyDecorator = modelBuilder.arrayProp.bind(modelBuilder)
// export const schema: (schemaOptions?: mongoose.SchemaOptions) => ClassDecorator = modelBuilder.schema.bind(modelBuilder)
export const post: <T>(method: string, fn: (error: mongoose.Error, doc: T, next: (err?: mongoose.NativeError) => void) => void) => ClassDecorator = modelBuilder.post.bind(modelBuilder)
export const pre: (method: string, parallel: boolean, fn: (next: (err?: mongoose.NativeError) => void, done: () => void) => void, errorCb?: (err: mongoose.Error) => void) => ClassDecorator = modelBuilder.pre.bind(modelBuilder)
export const plugin: (plugin: (schema: mongoose.Schema, options?: Object) => void, options?: Object) => ClassDecorator = modelBuilder.plugin.bind(modelBuilder)

// Base classes

export abstract class Schema {
    public __schema: mongoose.SchemaDefinition
    public __middleware: { pre: any[], post: any[] } = { pre: [], post: [] }
    public __plugins: any[]
    public __modelBuilder = container.get(Types.ModelBuilder)

    public getSchema(schemaOptions?: mongoose.SchemaOptions) {
        return composeSchemaForInstance(this, schemaOptions)
    }
}

export abstract class Model<T> extends Schema {
    public static readonly findOrCreate: <T>(query: object) => Promise<{ doc: mongoose.Document & T; created: boolean }>
    public __modelBuilder = container.get(Types.ModelBuilder)

    public _id: string
    public createdAt: any
    public updatedAt: any

    public readonly save: () => Promise<mongoose.Document & T>

    public getModel(schemaOptions?: mongoose.SchemaOptions) {
        return composeModelForInstance(this, schemaOptions)
    }
}

// Errors

export class InvalidArrayPropOptionsError extends Error { }
export class SchemaNotDefinedError extends Error { }

// Schema options

export class MongooseSchemaOptions {
    public static readonly Timestamped = { timestamps: true }
}

