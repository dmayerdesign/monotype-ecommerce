import { Response } from 'express'
import { inject, injectable } from 'inversify'
import {
    controller,
    httpDelete,
    httpGet,
    httpPost,
    interfaces,
    queryParam,
    requestBody,
    requestParam,
    response,
} from 'inversify-express-utils'

import { AppConfig } from '@mte/app-config'
import { ApiEndpoints, Types } from '@mte/common/constants'
import { Order } from '@mte/common/models/api-models/order'
import { ExecuteOrderRequest } from '@mte/common/models/api-requests/execute-order.request'
import { GetOrdersRequest } from '@mte/common/models/api-requests/get-orders.request'
import { ApiResponse } from '@mte/common/models/api-responses/api.response'
import { OrderService } from '../services/order.service'
import { WoocommerceMigrationService } from '../services/woocommerce-migration.service'
import { ApiController } from './api.controller'

@injectable()
@controller(ApiEndpoints.Orders)
export class OrdersController extends ApiController implements interfaces.Controller {

    constructor(
        @inject(Types.OrderService) private orderService: OrderService,
    ) { super() }

    @httpGet('/')
    public get(
        @queryParam('request') request: string,
        @response() res: Response,
    ): void {
        const parsedQuery = request ? <GetOrdersRequest>JSON.parse(request) : {}

        this.handleApiResponse(this.orderService.get(parsedQuery), res)
    }

    @httpGet('/:id')
    public getOne(
        @requestParam('id') id: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.orderService.getOne(id), res)
    }

    @httpPost('/execute')
    public execute(
        @requestBody() body: ExecuteOrderRequest,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.orderService.execute(body), res)
    }


    @httpDelete('/:id')
    public delete(
        @requestParam('id') id: string,
        @response() res: Response,
    ): void {
        this.handleApiResponse(this.orderService.deleteOne(id), res)
    }
}
