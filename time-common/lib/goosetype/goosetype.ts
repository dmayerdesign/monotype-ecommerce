import { model, DocumentToObjectOptions, ModelPopulateOptions, ModelUpdateOptions, MongooseDocument as Document, NativeError, Query, Schema, SchemaOptions, ValidationError } from 'mongoose'
import * as findOrCreate from 'mongoose-findorcreate'
import 'reflect-metadata'

import { camelCase, ArrayPropOptions, IMongooseDocument, IMongooseModel, ModelBuilder, MongooseSchemaOptions, PropOptions, Ref } from './goosetype-model-builder'

const modelBuilder = new ModelBuilder()

// Utilities

export function composeSchemaForInstance<T>(target: MongooseDocument, schemaOptions?: SchemaOptions): Schema {
    const schemaDefinition = modelBuilder.schemaDefinitions[camelCase(target.constructor.name)]
    const preMiddleware = modelBuilder.preMiddleware[camelCase(target.constructor.name)]
    const postMiddleware = modelBuilder.postMiddleware[camelCase(target.constructor.name)]
    const plugins = modelBuilder.plugins[camelCase(target.constructor.name)]

    const schema = new Schema(schemaDefinition, schemaOptions)

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
            schema.plugin(plugin[0] as (schema: Schema, options?: Object) => void, plugin[1] as Object)
        })
    }

    modelBuilder.schemas[camelCase(target.constructor.name)] = schema

    return schema
}

export function composeModelForInstance<T extends IMongooseDocument>(target: MongooseDocument, schemaOptions?: SchemaOptions): IMongooseModel<T> {
    const schema = composeSchemaForInstance<T>(target, schemaOptions)
    return model(target.constructor.name, schema) as IMongooseModel<T>
}

// Decorators

export function pre(method: string, parallel: boolean, fn: (next: (err?: NativeError) => void, done: () => void) => void, errorCb?: (err: Error) => void): ClassDecorator {
    return (constructor: any) => {
        modelBuilder.addTo('preMiddleware', constructor.name, [ method, parallel, fn ])
    }
}

export function post<T>(method: string, fn: (error: Error, doc: T, next: (err?: NativeError) => void) => void): ClassDecorator {
    return (constructor: any) => {
        modelBuilder.addTo('postMiddleware', constructor.name, [ method, fn ])
    }
}

export function plugin(plugin: (schema: Schema, options?: Object) => void, options?: Object): ClassDecorator {
    return (constructor: any) => {
        modelBuilder.addTo('plugins', constructor.name, [ plugin, options ])
    }
}

export function prop(options?: PropOptions): PropertyDecorator {
    return (target: any, key: string) => {
        modelBuilder.baseProp({ propType: 'object', target, key, options })
    }
}

export function arrayProp(options?: ArrayPropOptions): PropertyDecorator {
    return (target: any, key: string) => {
        modelBuilder.baseProp({ propType: 'array', target, key, options })
    }
}

// Base classes

export abstract class MongooseDocument<T = any> {
    public _doc?: T
    /** Hash containing current validation errors. */
    public errors?: Object
    /** This document's _id. */
    public _id?: any
    /** Boolean flag specifying if the document is new. */
    public isNew?: boolean
    /** The documents schema. */
    public schema?: Schema
    // public _id: string
    public createdAt?: any
    public updatedAt?: any

    /** Checks if a path is set to its default. */
    public $isDefault?(path?: string): boolean { return }

    /**
     * Takes a populated field and returns it to its unpopulated state.
     * If the path was not populated, this is a no-op.
     */
    public depopulate?(path: string) { return }

    /**
     * Returns true if the Document stores the same data as doc.
     * Documents are considered equal when they have matching _ids, unless neither document
     * has an _id, in which case this function falls back to usin deepEqual().
     * @param doc a document to compare
     */
    public equals?(doc: MongooseDocument): boolean { return }

    /**
     * Explicitly executes population and returns a promise.
     * Useful for ES2015 integration.
     * @returns promise that resolves to the document when population is done
     */
    public execPopulate?(): Promise<this> { return }

    /**
     * Returns the value of a path.
     * @param type optionally specify a type for on-the-fly attributes
     */
    public get?(path: string, type?: any): any { return }

    /**
     * Initializes the document without setters or marking anything modified.
     * Called internally after a document is returned from mongodb.
     * @param doc document returned by mongo
     * @param fn callback
     */
    public init?(doc: MongooseDocument, fn?: () => void): this { return this }
    // public init?(doc: MongooseDocument, opts: Object, fn?: () => void): this { return this }

    /** Helper for console.log */
    public inspect?(options?: Object): any { return }

    /**
     * Marks a path as invalid, causing validation to fail.
     * The errorMsg argument will become the message of the ValidationError.
     * The value argument (if passed) will be available through the ValidationError.value property.
     * @param path the field to invalidate
     * @param errorMsg the error which states the reason path was invalid
     * @param value optional invalid value
     * @param kind optional kind property for the error
     * @returns the current ValidationError, with all currently invalidated paths
     */
    public invalidate?(path: string, errorMsg: string | NativeError, value: any, kind?: string): ValidationError | boolean { return }

    /** Returns true if path was directly set and modified, else false. */
    public isDirectModified?(path: string): boolean { return }

    /** Checks if path was initialized */
    public isInit?(path: string): boolean { return }

    /**
     * Returns true if this document was modified, else false.
     * If path is given, checks if a path or any full path containing path as part of its path
     * chain has been modified.
     */
    public isModified?(path?: string): boolean { return }

    /** Checks if path was selected in the source query which initialized this document. */
    public isSelected?(path: string): boolean { return }

    /**
     * Marks the path as having pending changes to write to the db.
     * Very helpful when using Mixed types.
     * @param path the path to mark modified
     */
    public markModified?(path: string) { return }

    /** Returns the list of paths that have been modified. */
    public modifiedPaths?(): string[] { return }

    /**
     * Populates document references, executing the callback when complete.
     * If you want to use promises instead, use this function with
     * execPopulate()
     * Population does not occur unless a callback is passed or you explicitly
     * call execPopulate(). Passing the same path a second time will overwrite
     * the previous path options. See Model.populate() for explaination of options.
     * @param path The path to populate or an options object
     * @param names The properties to fetch from the populated document
     * @param callback When passed, population is invoked
     */
    public populate?(callback: (err: any, res: this) => void): this
    public populate?(path: string, callback?: (err: any, res: this) => void): this
    public populate?(path: string, names: string, callback?: (err: any, res: this) => void): this
    public populate?(options: ModelPopulateOptions | ModelPopulateOptions[], callback?: (err: any, res: this) => void): this

    /** Gets _id(s) used during population of the given path. If the path was not populated, undefined is returned. */
    public populated?(path: string): any { return }

    /**
     * Sets the value of a path, or many paths.
     * @param path path or object of key/vals to set
     * @param val the value to set
     * @param type optionally specify a type for "on-the-fly" attributes
     * @param options optionally specify options that modify the behavior of the set
     */
    public set?(path: string, val: any, options?: Object): this { return }
    // public set?(path: string, val: any, type: any, options?: Object): this { return }
    // public set?(value: Object): this { return }

    /**
     * The return value of this method is used in calls to JSON.stringify(doc).
     * This method accepts the same options as Document#toObject. To apply the
     * options to every document of your schema by default, set your schemas
     * toJSON option to the same argument.
     */
    public toJSON?(options?: DocumentToObjectOptions): Object { return }

    /**
     * Converts this document into a plain javascript object, ready for storage in MongoDB.
     * Buffers are converted to instances of mongodb.Binary for proper storage.
     */
    public toObject?(options?: DocumentToObjectOptions): Object { return }

    /** Helper for console.log */
    public toString(): string { return }

    /**
     * Clears the modified state on the specified path.
     * @param path the path to unmark modified
     */
    public unmarkModified?(path: string) { return }

    /** Sends an update command with this document _id as the query selector.  */
    public update?(doc: this, callback?: (err: any, raw: any) => void): Query<any> { return }
    public update?(doc: this, options: ModelUpdateOptions, callback?: (err: any, raw: any) => void): Query<any>

    /**
     * Executes registered validation rules for this document.
     * @param optional options internal options
     * @param callback callback called after validation completes, passing an error if one occurred
     */
    public validate?(callback?: (err: any) => void): Promise<void>
    public validate?(optional: Object, callback?: (err: any) => void): Promise<void>

    /**
     * Executes registered validation rules (skipping asynchronous validators) for this document.
     * This method is useful if you need synchronous validation.
     * @param pathsToValidate only validate the given paths
     * @returns MongooseError if there are errors during validation, or undefined if there is no error.
     */
    public validateSync?(pathsToValidate?: string | string[]): Error { return }

    public save?(...args: any[]): Promise<this> { return new Promise<this>((resolve) => {}) }
    // public save(fn?: (err: any, product: this, numAffected: number) => void): Promise<this> { return new Promise<this>((resolve) => {}) }


    /**
     * Goosetype functions
     */

    public getSchema?(schemaOptions?: SchemaOptions): Schema {
        return composeSchemaForInstance<T>(this, schemaOptions)
    }

    public getModel?(schemaOptions?: SchemaOptions): IMongooseModel<T & IMongooseDocument<T>> {
        return composeModelForInstance<T & IMongooseDocument>(this, schemaOptions)
    }
}

export { IMongooseModel, MongooseSchemaOptions, Ref }

