import { of as observableOf, BehaviorSubject, Observable, ReplaySubject } from 'rxjs'
import { filter } from 'rxjs/operators'
import { Action } from './action'
import { Reducer } from './reducer'

export class Store<StateType> {
    private _previousState: StateType
    private _statePump: BehaviorSubject<StateType>
    private _states: Observable<StateType>
    private _actionPump: ReplaySubject<Action>
    private _actions: Observable<Action>

    constructor(initialState: StateType, private _reducer: Reducer<StateType>) {
        this._statePump = new BehaviorSubject<StateType>(Object.assign({}, initialState))
        this._states = this._statePump.asObservable()
        this._actionPump = new ReplaySubject<Action>(1)
        this._actions = this._actionPump.asObservable()
    }

    public dispatch(action: Action): Observable<boolean> {
        const currentState = this._statePump.getValue()
        try {
            const newState = this._reducer(Object.assign({}, currentState), action)
            this._statePump.next(newState)
            this._previousState = currentState
            this._actionPump.next(action)
            return observableOf(true)
        }
        catch (failure) {
            console.error(failure)
            return observableOf(false)
        }
    }

    public get states(): Observable<StateType> {
        return this._states
    }

    public get state(): StateType {
        return this._statePump.getValue()
    }

    public get previousState(): StateType {
        return this._previousState
    }

    public get actions(): Observable<Action> {
        return this._actions
    }

    public reactTo<ActionType extends Action = Action>(action: ActionType): Observable<ActionType> {
        return this._actions.pipe(filter<ActionType>((a) => a.constructor === action.constructor))
    }
}
