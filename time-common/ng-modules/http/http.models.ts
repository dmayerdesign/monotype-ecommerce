import { HttpClient, HttpErrorResponse, HttpEvent, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { HttpStatus } from '../../constants/http'
import { ListFromIdsRequest, ListRequest } from '../../models/api-requests/list.request'

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
    public abstract endpoint: string
    public getRequestType? = ListRequest
    public getSomeRequestType? = ListFromIdsRequest

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

    constructor(protected http: HttpClient) {
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

    public get(request?: ListRequest): void {
        let params = new HttpParams()

        if (request) params = params.set('request', JSON.stringify(request))

        this.http.get<T[]>(this.endpoint, { params })
            .subscribe(
                (docs) => this.getSubject.next(docs),
                (error: SimpleError) => this.getErrorSubject.next(error),
            )
    }

    public getSome(ids: string[]): Observable<T[]> {
        const request = new this.getSomeRequestType()
        request.ids = ids

        const params = new HttpParams().set('request', JSON.stringify(request))

        return this.http.get<T[]>(this.endpoint, { params })
    }

    public getOne(id: string): void {
        this.http.get<T>(`${this.endpoint}/${id}`)
            .subscribe(
                (doc) => this.getOneSubject.next(doc),
                (error: SimpleError) => this.getOneErrorSubject.next(error),
            )
    }

    public create?(): void
    public update?(id: string, update: object): void
    public delete?(id: string): void
}

export abstract class IHttpSettings {
    public static httpFlashErrorBlacklist: { endpoint: string, method: string }[]
}
