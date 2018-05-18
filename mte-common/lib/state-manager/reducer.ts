import { Action } from './action'
import { Store } from './store'

export type Reducer<T> = (state: T, action: Action) => T
