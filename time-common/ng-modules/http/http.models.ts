import { HttpErrorResponse, HttpEvent } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { HttpStatus } from '../../constants/http'

export class SimpleError {
    public message: string
    public status: HttpStatus

    constructor(errorResponse?: HttpErrorResponse & HttpEvent<any>) {
        if (errorResponse) {
            this.message = errorResponse.error ? errorResponse.error.message : null
            this.status = errorResponse.status
        }
    }
}

export abstract class RestService<T> {
    protected getSubject = new Subject<T[]>()
    protected getOneSubject = new Subject<T>()
    protected createSubject = new Subject<T>()
    protected updateSubject = new Subject<T>()
    protected deleteSubject = new Subject<T>()

    protected getErrorSubject = new Subject<SimpleError>()
    protected getOneErrorSubject = new Subject<SimpleError>()
    protected createErrorSubject = new Subject<SimpleError>()
    protected updateErrorSubject = new Subject<SimpleError>()
    protected deleteErrorSubject = new Subject<SimpleError>()

    public data: T[]
    public get$: Observable<T[]>
    public getOne$: Observable<T>
    public create$: Observable<T>
    public update$: Observable<T>
    public delete$: Observable<T>

    public getError$: Observable<SimpleError>
    public getOneError$: Observable<SimpleError>
    public createError$: Observable<SimpleError>
    public updateError$: Observable<SimpleError>
    public deleteError$: Observable<SimpleError>

    constructor() {
        this.get$ = this.getSubject.asObservable()
        this.getOne$ = this.getOneSubject.asObservable()
        this.create$ = this.createSubject.asObservable()
        this.update$ = this.updateSubject.asObservable()
        this.delete$ = this.deleteSubject.asObservable()

        this.getError$ = this.getErrorSubject.asObservable()
        this.getOneError$ = this.getOneErrorSubject.asObservable()
        this.createError$ = this.createErrorSubject.asObservable()
        this.updateError$ = this.updateErrorSubject.asObservable()
        this.deleteError$ = this.deleteErrorSubject.asObservable()

        this.get$.subscribe(data => {
            this.data = data
        })
    }

    public get?() {}
    public getOne?(id: string) {}
    public create?() {}
    public update?(id: string, update: object) {}
    public delete?(id: string) {}
}

