import { Product } from '@mte/common/api/interfaces/product'
import { TaxonomyTerm } from '@mte/common/api/interfaces/taxonomy-term'
import { GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { MteFormBuilder } from '@mte/common/lib/ng-modules/forms/utilities/form.builder'
import { NgrxAction } from '@mte/common/models/ui/ngrx-action'
import { ProductService } from './services/product.service'
import { GetProductsRequestFromRoute } from './shop.state'

export abstract class ShopAction<PayloadType = any> extends NgrxAction<PayloadType> { }

export class GetProductsRequestUpdate extends ShopAction<{
    request: GetProductsRequest
    crudService: ProductService
}> {
    public type = 'Update the GetProductsRequest'
}

export class GetProductsRequestFromRouteUpdate extends ShopAction<GetProductsRequestFromRoute> {
    public type = 'Update the GetProductsRequest based on the route params'
}

export class GetProductsSuccess extends ShopAction<void> {
    public type = 'Report the success of GetProducts'
}

export class ProductsFilterFormBuildersUpdate extends ShopAction<MteFormBuilder[]> {
    public type = 'Update the products filter form builders'
}

export class TaxonomyTermInViewUpdate extends ShopAction<string> {
    public type = 'Update the taxonomy term slug representing the products being viewed'
}

export class TaxonomyTermInViewUpdateSuccess extends ShopAction<TaxonomyTerm> {
    public type = 'Update the taxonomy term representing the products being viewed'
}

export class ProductsFilterFormsReset extends ShopAction<void> {
    public type = 'Reset the form values for each products filter'
}
