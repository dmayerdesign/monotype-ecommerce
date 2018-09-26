import { CartItem } from '@mte/common/api/interfaces/cart-item'
import { Product } from '@mte/common/api/interfaces/product'
import { GetCartItemsFromIdsRequest } from '@mte/common/api/requests/get-cart-items-from-ids.request'
import { ApiResponse } from '@mte/common/api/responses/api.response'

export class CartServiceStub {
    public async refresh(_request: GetCartItemsFromIdsRequest): Promise<ApiResponse<CartItem[]>> {
        return new ApiResponse<CartItem[]>([])
    }

    public async getItem(_id: string): Promise<ApiResponse<CartItem>> {
        return new ApiResponse<CartItem>({} as Product)
    }
}
