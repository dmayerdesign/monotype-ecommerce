import { Order } from '@mte/common/api/entities/order'
import { StripeCardToken } from '@mte/common/api/entities/stripe-card-token'
import { Currency } from '@mte/common/constants/enums/currency'
import { OrderStatus } from '@mte/common/constants/enums/order-status'
import { Types } from '@mte/common/constants/inversify/types'
import { Container } from 'inversify'
import 'reflect-metadata'
import { DbClient } from '../data-access/db-client'
import { ProductSearchHelper } from '../helpers/product-search.helper'
import { OrderService } from '../services/order.service'
import { OrganizationService } from '../services/organization.service'
import { ProductService } from '../services/product.service'
import { initTestDbSetupAndTeardown } from './init-test-db-setup-and-teardown'

describe('OrderService', () => {
    let dbClient: DbClient<Order>
    let container: Container
    let stripeOrderService: any
    let cartService: any
    let emailService: any
    let orderService: OrderService

    initTestDbSetupAndTeardown()

    beforeEach(() => {
        container = new Container()
        dbClient = new DbClient<Order>()

        stripeOrderService = { submitOrder: async (order: Order) => ({ body: { order } }) }
        cartService = { refresh: async () => ({ body: [] }) }
        emailService = { sendReceipt: async () => {} }

        container.bind(Types.DbClient).toConstantValue(dbClient)
        container.bind(Types.StripeOrderService).toConstantValue(stripeOrderService)
        container.bind(Types.CartService).toConstantValue(cartService)
        container.bind(Types.ProductSearchHelper).toConstantValue(new ProductSearchHelper())
        container.bind(Types.EmailService).toConstantValue(emailService)
        container.bind(Types.OrganizationService).to(OrganizationService)
        container.bind(Types.ProductService).to(ProductService)
        container.bind(Types.OrderService).to(OrderService)

        orderService = container.get(Types.OrderService)
    })

    test('should place an order', async (done) => {
        const response = await orderService.place({
            items: [],
            discounts: [],
            subTotal: { amount: 100, currency: Currency.USD },
            total: { amount: 100, currency: Currency.USD },
            taxPercent: 6,
            shippingCost: { amount: 5, currency: Currency.USD },
            shippingRates: [],
            selectedShippingRateId: 'selectedShippingRateId',
            shippingInsuranceAmt: 0,
            carrier: 'USPS',
            trackingCode: 'xyz',
            estDeliveryDays: 3,
            postageLabelUrl: 'postageLabelUrl',
            paymentMethod: 'paymentMethod',
            savePaymentInfo: false,
            shipmentId: 'shipmentId',
            status: OrderStatus.Pending,
            stripeCardId: 'xyz',
            stripeOrderId: 'xyz',
            stripeSource: 'xyz',
            stripeToken: {} as StripeCardToken,
            customer: {
                userId: 'xyz',
                firstName: 'Test',
                lastName: 'Customer',
                stripeCustomerId: 'xyz',
                email: 'test@customer.com',
                shippingAddress: {
                    street1: '2714 Alamo Dr',
                    city: 'Orlando',
                    state: 'FL',
                    zip: '32805',
                    country: 'USA',
                },
                billingAddress: {
                    street1: '2714 Alamo Dr',
                    city: 'Orlando',
                    state: 'FL',
                    zip: '32805',
                    country: 'USA',
                },
                savePaymentInfo: false
            },
        })

        expect(response).toBeTruthy()
        done()
    })
})
