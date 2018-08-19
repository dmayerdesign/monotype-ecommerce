import { Action } from '@mte/common/lib/state-manager/action'
import { GetProductsRequest } from '@mte/common/models/api-requests/get-products.request'
import { GetProductsRequestFromRoute } from './products.state'

export class GetProductsRequestUpdate extends Action<GetProductsRequest> { }
export class GetProductsRequestFromRouteUpdate extends Action<GetProductsRequestFromRoute> { }

export type ProductsAction = GetProductsRequestUpdate
