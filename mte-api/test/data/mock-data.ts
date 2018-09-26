import { StripeCardToken } from '@mte/common/api/interfaces/stripe-card-token'
import { Currency } from '@mte/common/constants/enums/currency'
import { OrderStatus } from '@mte/common/constants/enums/order-status'

export const mockOrder = {
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
}
