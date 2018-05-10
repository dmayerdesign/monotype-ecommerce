import { camelCase } from 'lodash'
import * as mongoose from 'mongoose'
import { modelBuilder } from '../goosetype-model-builder'
import { MongooseDocument } from '../models/mongoose-document'
import { MongooseModel } from '../models/mongoose-model'

function composeSchemaForInstance<T>(target: MongooseDocument, schemaOptions?: mongoose.SchemaOptions): mongoose.Schema {
    const schemaDefinition = modelBuilder.schemaDefinitions[camelCase(target.constructor.name)]
    const preMiddleware = modelBuilder.preMiddleware[camelCase(target.constructor.name)]
    const postMiddleware = modelBuilder.postMiddleware[camelCase(target.constructor.name)]
    const plugins = modelBuilder.plugins[camelCase(target.constructor.name)]

    if (target.constructor.name === 'AttributeValue') {
        console.log(JSON.stringify(schemaDefinition))
        console.log(JSON.stringify(plugins))
    }

    schemaOptions = {
        ...schemaOptions,
        ...{ usePushEach: true }, // https://github.com/Automattic/mongoose/issues/5574
    } as mongoose.SchemaOptions

    let schema: mongoose.Schema
    if (!modelBuilder.schemas[camelCase(target.constructor.name)]) {
        schema = new mongoose.Schema(schemaDefinition, schemaOptions)
        modelBuilder.schemas[camelCase(target.constructor.name)] = schema
    } else {
        schema = modelBuilder.schemas[camelCase(target.constructor.name)]
        Object.keys(schemaDefinition).forEach((schemaKey) => {
            schema.add({ [schemaKey]: schemaDefinition[schemaKey] })
        })
    }

    if (preMiddleware) {
        preMiddleware.forEach((preHookArgs) => {
            if (preHookArgs.length > 1) {
                (schema.pre as any)(...preHookArgs)
            }
            else {
                throw new Error(`Invalid number of preMiddleware arguments: got ${preHookArgs.length}, expected 2 or more`)
            }
        })
    }

    if (postMiddleware) {
        postMiddleware.post.forEach((postHookArgs) => {
            if (postHookArgs.length > 1) {
                (schema.post as any)(...postHookArgs)
            }
            else {
                throw new Error(`Invalid number of postMiddleware arguments: got ${postHookArgs.length}, expected 2 or more`)
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

function composeModelForInstance(target: MongooseDocument, schemaOptions?: mongoose.SchemaOptions): MongooseModel {
    const schema = composeSchemaForInstance(target, schemaOptions)
    const model = mongoose.model(target.constructor.name, schema) as MongooseModel
    if (!(target.constructor as typeof MongooseDocument).__model) {
        (target.constructor as typeof MongooseDocument).__model = model
    }
    return (target.constructor as typeof MongooseDocument).__model
}

// function getSchema(target: typeof MongooseDocument, schemaOptions?: SchemaOptions): Schema {
//     return composeSchemaForInstance(target, schemaOptions)
// }

function getSchema(target: MongooseDocument, schemaOptions?: mongoose.SchemaOptions): mongoose.Schema {
    return composeSchemaForInstance(target, {
        ...schemaOptions,
        ...{
            toObject: { getters: true },
            toJSON: { getters: true }
        }
    })
}

function getModel(target: MongooseDocument, schemaOptions?: mongoose.SchemaOptions): MongooseModel {
    return composeModelForInstance(target, schemaOptions)
}

export function schema(ctorRef: typeof MongooseDocument & any, schemaOptions?: mongoose.SchemaOptions): ClassDecorator {
    const target = new ctorRef()
    setTimeout(() => getSchema(target, schemaOptions))
    return function(ctor: typeof ctorRef): any {
        return ctor
    }
}

export function model(ctorRef: typeof MongooseDocument & any, schemaOptions?: mongoose.SchemaOptions): ClassDecorator {
    const target = new ctorRef()
    setTimeout(() => getModel(target, schemaOptions))
    return function(ctor: typeof ctorRef): any {
        return ctor
    }
}
