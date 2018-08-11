import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { RestService, SimpleError } from '@mte/common/lib/ng-modules/http'
import { TaxonomyTerm } from '@mte/common/models/api-interfaces/taxonomy-term'

@Injectable({ providedIn: 'root' })
export class TaxonomyTermService extends RestService<TaxonomyTerm> {
    public endpoint = ApiEndpoints.TaxonomyTerms

    constructor (
        protected httpClient: HttpClient,
    ) { super(httpClient) }
}
