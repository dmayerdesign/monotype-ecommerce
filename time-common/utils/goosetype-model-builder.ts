import { injectable } from 'inversify'
import * as mongoose from 'mongoose'

// Errors

export class InvalidArrayPropOptionsError extends Error { }
export class SchemaNotDefinedError extends Error { }

// Schema options

export class MongooseSchemaOptions {
    public static readonly Timestamped = { timestamps: true }
}

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

export interface IMongooseDocument<T = any> extends mongoose.Document {
    _id: string
    createdAt?: any
    updatedAt?: any
}

export interface IMongooseModel<T = any> extends mongoose.Model<T & (IMongooseDocument | mongoose.Document)> {
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
    target: IMongooseModel<any>
}

export type PropType = 'array' | 'object'
export type PropOptionsWithNumberValidate = PropOptions & ValidateNumberOptions
export type PropOptionsWithStringValidate = PropOptions & ValidateStringOptions
export type PropOptionsWithValidate = PropOptionsWithNumberValidate | PropOptionsWithStringValidate
export type Ref<T> = T | string

// Model builder

let modelBuilder: ModelBuilder
// @injectable()
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

    public get find() {
        const that = this
        return {
            schema(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.schemas[name]) {
                    return that.schemas[name]
                }
                else {
                    return null
                }
            },
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
            schema(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.find.schema(name)) {
                    return that.find.schema(name)
                }
                else {
                    that.schemas[name] = new mongoose.Schema(that.schemaDefinitions[name])
                    return that.schemas[name]
                }
            },
            schemaDefinition(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.find.schemaDefinition(name)) {
                    return that.find.schemaDefinition(name)
                }
                else {
                    that.schemaDefinitions[name] = {}
                    return that.schemaDefinitions[name]
                }
            },
            preMiddleware(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.find.preMiddleware(name)) {
                    return that.find.preMiddleware(name)
                }
                else {
                    that.preMiddleware[name] = []
                    return that.preMiddleware[name]
                }
            },
            postMiddleware(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.find.postMiddleware(name)) {
                    return that.find.postMiddleware(name)
                }
                else {
                    that.postMiddleware[name] = []
                    return that.postMiddleware[name]
                }
            },
            plugin(schemaName) {
                const name = schemaName.charAt(0).toLowerCase() + schemaName.substring(1)
                if (that.find.plugin(name)) {
                    return that.find.plugin(name)
                }
                else {
                    that.plugins[name] = []
                    return that.plugins[name]
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
            if (!this.schemaDefinitions[type.name.charAt(0).toLowerCase() + type.name.substring(1)]) {
                console.log(this.schemaDefinitions)
                throw new SchemaNotDefinedError(`A schema associated with ${type.name} has not been defined. Make sure the class extends MongooseDocument.`)
            }
            return this.findOrCreate.schema(type.name)
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

            if (options) {
                if ((options as SchemaTypeOptions).type) {
                    type = (options as SchemaTypeOptions).type
                }
                if ((options as SchemaTypeOptions).ref) {
                    type = mongoose.Schema.Types.ObjectId
                }
            }

            console.log(type)
            console.log(this.getTypeOrSchema(type))

            schemaProperty.type = this.getTypeOrSchema(type)
        }
    }
    public prop(options?: PropOptions) {
        return (target: any, key: string) => {
            this.baseProp({ propType: 'object', target, key, options })
        }
    }
    public arrayProp(options?: ArrayPropOptions) {
        return (target: any, key: string) => {
            this.baseProp({ propType: 'array', target, key, options })
        }
    }
}
