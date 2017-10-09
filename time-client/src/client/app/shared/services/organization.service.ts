import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Subject } from 'rxjs/Subject'

import { appConfig } from '@time/app-config'
import { IOrganization } from '@time/common/models/interfaces'
import { SimpleError } from '@time/common/ng-modules/http'

@Injectable()
export class OrganizationService {
    public organization: IOrganization
    public organization$: Observable<IOrganization>
    public organizationError$: Observable<SimpleError>
    private organizationSubject = new ReplaySubject<IOrganization>()
    private organizationErrorSubject = new Subject<SimpleError>()

    constructor (
        private http: HttpClient,
    ) {
        this.organization$ = this.organizationSubject.asObservable()
        this.organizationError$ = this.organizationErrorSubject.asObservable()

        this.get()
    }

    public get(): void {
        this.http.get(appConfig.client_url + "/api/organization")
            .subscribe(
                (organization: IOrganization) => {
                    this.organization = organization
                    this.organizationSubject.next(organization)
                },
                (error: SimpleError) => this.organizationErrorSubject.next(error),
            )
    }
}
