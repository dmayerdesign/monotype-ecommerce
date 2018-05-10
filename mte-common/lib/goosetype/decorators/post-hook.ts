import { NativeError } from 'mongoose'
import { modelBuilder } from '../goosetype-model-builder'

export function post<T>(method: string, fn: (error: Error, doc: T, next: (err?: NativeError) => void) => void): ClassDecorator {
    return (constructor: any) => {
        modelBuilder.addTo('postMiddleware', constructor.name, [ method, fn ])
    }
}
