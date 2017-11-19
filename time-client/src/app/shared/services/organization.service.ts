import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Subject } from 'rxjs/Subject'

import { Endpoints } from '@time/common/constants/endpoints'
import { Organization } from '@time/common/models/api-models/organization'
import { SimpleError } from '@time/common/ng-modules/http'

@Injectable()
export class OrganizationService {
    public organization: Organization
    public organization$: Observable<Organization>
    public organizationError$: Observable<SimpleError>
    private organizationSubject = new ReplaySubject<Organization>(1)
    private organizationErrorSubject = new Subject<SimpleError>()

    constructor (
        private http: HttpClient,
    ) {
        this.get()
    }

    public get() {
        this.http.get<Organization>(Endpoints.Organization)
            .subscribe(
                organization => {
                    this.organization = organization
                    this.organizationSubject.next(organization)
                },
                (error: SimpleError) => this.organizationErrorSubject.next(error),
            )
    }
}
