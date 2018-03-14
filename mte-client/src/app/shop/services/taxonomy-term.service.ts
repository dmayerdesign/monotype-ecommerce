import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { TaxonomyTerm } from '@mte/common/models/api-models/taxonomy-term'
import { GetTaxonomyTermsFromIdsRequest, GetTaxonomyTermsRequest } from '@mte/common/models/api-requests/get-taxonomy-terms.request'
import { SimpleError } from '@mte/common/ng-modules/http'
import { RestService } from '@mte/common/ng-modules/http/http.models'
import { Subject } from 'rxjs/Subject'

@Injectable()
export class TaxonomyTermService extends RestService<TaxonomyTerm> {
    public endpoint = ApiEndpoints.TaxonomyTerms

    constructor (
        protected http: HttpClient,
    ) {
        super(http)
    }

    public getOne(slug: string): void {
        this.http.get<TaxonomyTerm>(`${this.endpoint}/${slug}`)
            .subscribe(
                (doc) => this.getOnePump.next(doc),
                (error: SimpleError) => this.getOneErrorPump.next(error),
            )
    }
}
