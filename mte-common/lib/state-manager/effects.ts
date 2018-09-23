import { Action } from './action'
import { Type } from '@angular/core'
import { Observable } from 'rxjs'

export type Effect = <ActionType extends Action = Action>(
    ...actionTypes: Type<ActionType>[]
) => Observable<ActionType>

export interface Effects {
    oneOf: Effect
    allBut: Effect
}
