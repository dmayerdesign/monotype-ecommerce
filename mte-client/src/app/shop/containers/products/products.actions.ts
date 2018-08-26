import { GetProductsRequest } from '@mte/common/api/requests/get-products.request'
import { Action } from '@mte/common/lib/state-manager/action'
import { GetProductsRequestFromRoute } from './products.state'

export class GetProductsRequestUpdate extends Action<GetProductsRequest> { }
export class GetProductsRequestFromRouteUpdate extends Action<GetProductsRequestFromRoute> { }

export type ProductsAction = GetProductsRequestUpdate
