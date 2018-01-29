import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Subject } from 'rxjs/Subject'

import { ApiEndpoints } from '@time/common/constants/api-endpoints'
import { Organization } from '@time/common/models/api-models/organization'
import { SimpleError } from '@time/common/ng-modules/http'

@Injectable()
export class OrganizationService {
    public organization: Organization
    private organizationPump = new ReplaySubject<Organization>(1)
    public organizations = this.organizationPump.asObservable()
    private organizationErrorPump = new Subject<SimpleError>()
    public organizationErrors = this.organizationErrorPump.asObservable()

    constructor (
        private http: HttpClient,
    ) {
        this.get()
    }

    public get() {
        this.http.get<Organization>(ApiEndpoints.Organization)
            .subscribe(
                organization => {
                    this.organization = organization
                    this.organizationPump.next(organization)
                },
                (error: SimpleError) => this.organizationErrorPump.next(error),
            )
    }
}