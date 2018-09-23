import { Type } from '@angular/core'
import { Observable } from 'rxjs'
import { Action } from './action'

export type Effect<ActionType extends Action = Action> = (
    ...actionTypes: Type<ActionType>[]
) => Observable<ActionType>

export interface Effects<ActionType extends Action = Action> {
    oneOf: Effect<ActionType>
    allBut: Effect<ActionType>
}
