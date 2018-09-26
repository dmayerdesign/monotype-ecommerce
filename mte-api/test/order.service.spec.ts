import { Order } from '@mte/common/api/entities/order'
import { Types } from '@mte/common/constants/inversify/types'
import { Container } from 'inversify'
import 'reflect-metadata'
import { DbClient } from '../data-access/db-client'
import { ProductSearchHelper } from '../helpers/product-search.helper'
import { EmailService } from '../interfaces/email-service'
import { OrderService } from '../services/order.service'
import { OrganizationService } from '../services/organization.service'
import { ProductService } from '../services/product.service'
import { mockOrder } from './data/mock-data'
import { initTestDbSetupAndTeardown } from './init-test-db-setup-and-teardown'
import { CartServiceStub } from './stub-services/cart-service.stub'
import { EmailServiceStub } from './stub-services/email-service.stub'

describe('OrderService', () => {
    let dbClient: DbClient<Order>
    let container: Container
    let stripeOrderService: any
    let cartService: any
    let productSearchHelper: any
    let emailService: EmailService
    let orderService: OrderService

    initTestDbSetupAndTeardown()

    beforeEach(() => {
        container = new Container()
        dbClient = new DbClient<Order>()
        stripeOrderService = { submitOrder: async (order: Order) => ({ body: { order } }) }
        cartService = new CartServiceStub()
        emailService = new EmailServiceStub()
        productSearchHelper = new ProductSearchHelper()

        container.bind(Types.DbClient).toConstantValue(dbClient)
        container.bind(Types.StripeOrderService).toConstantValue(stripeOrderService)
        container.bind(Types.CartService).toConstantValue(cartService)
        container.bind(Types.ProductSearchHelper).toConstantValue(productSearchHelper)
        container.bind(Types.EmailService).toConstantValue(emailService)
        container.bind(Types.OrganizationService).to(OrganizationService)
        container.bind(Types.ProductService).to(ProductService)
        container.bind(Types.OrderService).to(OrderService)

        orderService = container.get(Types.OrderService)
    })

    test('should place an order', async (done) => {
        const { body } = await orderService.place(mockOrder)
        expect(body).toBeTruthy()
        done()
    })
})
