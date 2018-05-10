import { injectable } from 'inversify'
import { camelCase } from 'lodash'
import * as mongoose from 'mongoose'
import { PropTypeArgs } from './models/mongoose-model'

// Errors.

export class InvalidArrayPropOptionsError extends Error { }
export class SchemaNotDefinedError extends Error { }

// Model builder.

// Create a singleton.
let modelBuilder: ModelBuilder

export class ModelBuilder {
    public schemaDefinitions: { [key: string]: mongoose.SchemaDefinition } = {}
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
            // If the prop is not a valid primitive or object, and it's not an ObjectId,
            // assume it's a custom schema. If the schema has yet to be defined, define it.
            // (This will probably only happen if you're using a schema class as the type
            // of one of its own properties.)
            if (!this.schemas[camelCase(type.name)]) {
                this.schemas[camelCase(type.name)] = new mongoose.Schema()
            }
            return this.schemas[camelCase(type.name)]
        }
    }

    public baseProp(propTypeArgs: PropTypeArgs): void {
        const { target, key, propType, options } = propTypeArgs
        let schemaDefinition: mongoose.SchemaDefinition = this.schemaDefinitions[camelCase(target.constructor.name)]
        let schemaProperty: mongoose.SchemaTypeOpts<any> = {}
        let type: any

        const nonPropertyOptions = [
            'items',
            'itemsRef'
        ]

        if (!schemaDefinition) {
            schemaDefinition = this.schemaDefinitions[camelCase(target.constructor.name)] = {}
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

        schemaDefinition[key] = schemaProperty
    }
}

modelBuilder = new ModelBuilder()
export { modelBuilder }
