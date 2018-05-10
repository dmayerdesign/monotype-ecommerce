import { NativeError } from 'mongoose'
import { modelBuilder } from '../goosetype-model-builder'

export function pre(method: string, parallel: boolean, fn: (next: (err?: NativeError) => void, done: () => void) => void, errorCb?: (err: Error) => void): ClassDecorator {
    return (constructor: any) => {
        modelBuilder.addTo('preMiddleware', constructor.name, [ method, parallel, fn ])
    }
}
