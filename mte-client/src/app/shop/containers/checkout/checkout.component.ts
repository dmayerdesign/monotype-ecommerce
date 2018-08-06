import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormGroup, Validators } from '@angular/forms'
import { AppConfig } from '@mte/app-config'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { MteFormBuilderService } from '@mte/common/lib/ng-modules/forms/services/form-builder.service'
import { MteFormBuilder } from '@mte/common/lib/ng-modules/forms/utilities/form.builder'
import { platform } from '@mte/common/lib/ng-modules/ui/utils/platform'
import { Order } from '@mte/common/models/api-interfaces/order'
import { OrderCustomer } from '@mte/common/models/api-interfaces/order-customer'
import { Organization } from '@mte/common/models/api-interfaces/organization'
import { Product } from '@mte/common/models/api-interfaces/product'
import { Currency } from '@mte/common/models/enums/currency'
import { OrderStatus } from '@mte/common/models/enums/order-status'
import { fromEvent } from 'rxjs'
import { filter, takeWhile } from 'rxjs/operators'
import { CartService } from '../../../shared/services/cart/cart.service'
import { OrganizationService } from '../../../shared/services/organization.service'
import { UserService } from '../../../shared/services/user.service'
import { OrderService } from '../../services/order.service'
import { PaymentServiceProviderService } from '../../services/payment-service-provider.service'
import { checkoutForm } from './checkout-form'

@Component({
    selector: 'mte-checkout',
    templateUrl: './checkout.component.html',
})
@Heartbeat()
export class CheckoutComponent extends HeartbeatComponent implements OnDestroy, OnInit {
    public order: Order = {
        status: OrderStatus.PreSubmitInvalid
    } as Order
    public orderCustomer: OrderCustomer
    public organization: Organization

    // State.

    public checkoutFormGroup: FormGroup
    public checkoutForm: MteFormBuilder
    public isReadyForPayment = true
    public orderProcessing: boolean
    public orderSucceeded: boolean
    public orderFailed: boolean
    public shouldSavePaymentInfo = false

    // Stripe variables.

    public stripe: any
    public elements: any
    public cardElement: any
    public cards: any[]

    // DOM elements.

    private _cardElementDiv: HTMLElement
    private _cardNumberInput: HTMLInputElement
    private _cardExpiryInput: HTMLInputElement

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private organizationService: OrganizationService,
        private paymentServiceProviderService: PaymentServiceProviderService,
        private mteFormBuilder: MteFormBuilderService,
        private userService: UserService,
    ) { super() }

    public async ngOnInit(): Promise<void> {
        // [FOR TESTING]
        this.orderCustomer = {
            firstName: 'Danny',
            lastName: 'Mayer',
            userId: '5a75411c6dd6c82934b8f1bb',
            email: 'd.a.mayer92@gmail.com',
            shippingAddress: {
                street1: '2714 Alamo Dr',
                city: 'Orlando',
                state: 'FL',
                zip: '32805',
                country: 'United States',
            },
            billingAddress: {
                street1: '2714 Alamo Dr',
                city: 'Orlando',
                state: 'FL',
                zip: '32805',
                country: 'United States',
            },
        } as OrderCustomer
        // [/FOR TESTING]

        // Get the organization.

        this.organization = this.organizationService.organization

        // Create the checkout form.

        this.checkoutForm = this.mteFormBuilder.create(checkoutForm)
        this.checkoutFormGroup = this.checkoutForm.formGroup

        // Subscribe to checkout form changes.

        this.checkoutFormGroup.statusChanges
            .pipe(takeWhile(() => this.isAlive))
            .subscribe(() => {
                this.order.status = this.checkoutFormGroup.invalid
                    ? OrderStatus.PreSubmitInvalid
                    : OrderStatus.PreSubmitValid
            })

        // Get the cart.

        this.cartService.store.states.subscribe(() => {
            this.populateOrder()
        })

        // Initialize Stripe.

        if (platform.isBrowser()) {
            this.stripe = (window as any).Stripe(AppConfig.stripe_publishable_key)
            setTimeout(() => this.initStripeForm())
        }

        // If a user exists and it has a `stripeCustomerId`, get the Stripe Customer.

        if (this.userService.user && this.userService.user.stripeCustomerId) {
            this.paymentServiceProviderService
                .getStripeCustomer(this.userService.user.stripeCustomerId)
                .pipe(filter((customer) => !!customer))
                .subscribe((customer) => {
                    if (customer.sources) {

                        // Populate `this.cards` with `customer.sources.data`.

                        this.cards = customer.sources.data // stripe.cards.ICard[]

                        // If the Stripe customer has a `default_source`, move it to the top
                        // of `this.cards`.

                        const customerDefaultSourceId = typeof customer.default_source === 'string'
                            ? customer.default_source
                            : customer.default_source.id
                        const defaultCardIndex = this.cards.findIndex((card) => card.id === customerDefaultSourceId)
                        if (defaultCardIndex) {
                            const defaultCard = this.cards.splice(defaultCardIndex, 1)[0]
                            this.cards = [
                                defaultCard,
                                ...this.cards,
                            ]
                        }

                        // If the user hasn't already filled out the billing address, populate
                        // it with data taken from the `defaultCard`.

                        if (
                            !this.checkoutFormGroup.get('billingAddressStreet1').value &&
                            !this.checkoutFormGroup.get('billingAddressStreet2').value &&
                            !this.checkoutFormGroup.get('billingAddressCity').value &&
                            !this.checkoutFormGroup.get('billingAddressState').value &&
                            !this.checkoutFormGroup.get('billingAddressZip').value
                        ) {
                            this._populateFormWithStripeCardBillingAddress(this.cards[0])
                        }
                    }
                    if (!this.orderCustomer) {
                        this.orderCustomer = {} as OrderCustomer
                    }
                    this.orderCustomer.stripeCustomerId = customer.id
                })
        }
    }

    public ngOnDestroy(): void { }

    public initStripeForm(): void {
        this.elements = this.stripe.elements()

		// Create an instance of the card Element.

        this.cardElement = this.elements.create('card', {})

		// Add an instance of the card Element into the `#card-element` div.

        this.cardElement.mount('#card-element')

        setTimeout(() => {
            this._cardElementDiv = document.getElementById('card-element')
            this._cardNumberInput = this._cardElementDiv.querySelector('.CardField-number input')
            this._cardExpiryInput = this._cardElementDiv.querySelector('.CardField-expiry input')
        })

        fromEvent(this.cardElement, 'change')
            .pipe(takeWhile(() => this.isAlive))
            .subscribe(({ error }) => {
                const displayError = document.getElementById('card-errors')
                if (error) {
                    displayError.textContent = error.message
                } else {
                    displayError.textContent = ''
                }
            })
    }

    /**
     * Populate the order with items and other data.
     * Should behave idempotently once `this.cartService.cart.items` and `this.orderCustomer` populate.
     */
    public async populateOrder(): Promise<Order> {
        this.order.items = this.cartService.cart.items.map((item: Product) => item._id)
        this.order.subTotal = this.cartService.cart.subTotal
        this.order.total = this.cartService.cart.total

        this.order.taxPercent =
            this.organization.retailSettings.addSalesTax
            ? this.organization.retailSettings.salesTaxPercentage
            : 0

        this.order.shippingCost =
            !this.order.shippingCost && this.organization.retailSettings.shippingFlatRate
            ? this.organization.retailSettings.shippingFlatRate
            : { amount: 0, currency: Currency.USD }

        if (!this.order.shippingCost && this.organization.retailSettings.shippingFlatRate) {
            this.order.shippingCost = this.organization.retailSettings.shippingFlatRate
        }

        this.order.customer = this.orderCustomer

        // TODO: Fill `orderCustomer.shippingAddress` and `orderCustomer.billingAddress`
        // with the values from `checkoutForm`

        return this.order
    }

    public handleSelectedCardChange(stripeCard: any): void {
        if (stripeCard) {
            this._populateFormWithStripeCardBillingAddress(stripeCard)
            this._populateStripeCardFormFromCard(stripeCard)
        }
    }

    private _populateFormWithStripeCardBillingAddress(stripeCard: any): void {
        const {
            address_line1,
            address_line2,
            address_city,
            address_state,
            // address_country,
            address_zip,
            address_line1_check,
            address_zip_check
        } = stripeCard

        if (
            address_line1 &&
            address_line1_check !== 'fail' &&
            address_line1_check !== 'unavailable'
        ) {
            this.checkoutFormGroup.patchValue({ billingAddressStreet1: address_line1 })
        }
        if (address_line2) {
            this.checkoutFormGroup.patchValue({ billingAddressStreet2: address_line2 })
        }
        if (address_city) {
            this.checkoutFormGroup.patchValue({ billingAddressCity: address_city })
        }
        if (address_state) {
            this.checkoutFormGroup.patchValue({ billingAddressState: address_state })
        }
        if (
            address_zip &&
            address_zip_check !== 'fail' &&
            address_zip_check !== 'unavailable'
        ) {
            this.checkoutFormGroup.patchValue({
                billingAddressZip: address_zip
            })
        }

        console.log(this.checkoutFormGroup)
    }

    private _populateStripeCardFormFromCard(stripeCard: any): void {
        const numberInputValueGroup1 = stripeCard.number.toString().substr(0, 4)
        const numberInputValueGroup2 = stripeCard.number.toString().substr(4, 4)
        const numberInputValueGroup3 = stripeCard.number.toString().substr(8, 4)
        const numberInputValueGroup4 = stripeCard.number.toString().substr(12, 4)
        const numberInputValue = `${numberInputValueGroup1} ${numberInputValueGroup2} ${numberInputValueGroup3} ${numberInputValueGroup4}`
        const expiryInputValue = `${stripeCard.exp_month} / ${stripeCard.exp_year.toString().substr(2)}`
        this._cardNumberInput.value = numberInputValue
        this._cardExpiryInput.value = expiryInputValue
    }

    public async submit(): Promise<void> {
        if (!this.cardElement) return

        this.populateOrder()

        const stripeCreateTokenResult: { error: Error, token: any } = await this.stripe
            .createToken(this.cardElement)

        if (stripeCreateTokenResult.error) {
            // Inform the user if there was an error
            const errorElement = document.getElementById('card-errors')
            errorElement.textContent = stripeCreateTokenResult.error.message
        }
        else {
            this.order.stripeToken = stripeCreateTokenResult.token

            this.processOrder()
        }
    }

    public async processOrder(): Promise<void> {
        await this.orderService.place(this.order).toPromise()
    }
}
