import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

import { OrderBuilder } from '@mte/common/builders/order.builder'
import { MteFormBuilderService } from '@mte/common/lib/ng-modules/forms/services/form-builder.service'
import { MteFormBuilder } from '@mte/common/lib/ng-modules/forms/utilities/form.builder'
import { platform } from '@mte/common/lib/ng-modules/ui/utils/platform'
import { Cart } from '@mte/common/models/api-models/cart'
import { Organization } from '@mte/common/models/api-models/organization'
import { Product } from '@mte/common/models/api-models/product'
import { User } from '@mte/common/models/api-models/user'
import { Currency } from '@mte/common/models/enums/currency'
import { OrderStatus } from '@mte/common/models/enums/order-status'
import { Price } from '@mte/common/models/interfaces/api/price'
import { CartService, OrganizationService, UiService, UserService } from '../../../shared/services'
import { CheckoutService } from '../../services/checkout.service'

@Component({
    selector: 'checkout',
    templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {

    // The cast of crazy characters.
    private user: User
    // private stripeCustomer: any
    private order: OrderBuilder
    private organization: Organization
    private cart: Cart

    // They're on a quest to COLLECT PAYMENT on an order.
    public checkoutFormGroup: FormGroup
    public checkoutForm: MteFormBuilder
    public isReadyForPayment = false //
    private orderProcessing: boolean //
    private orderSucceeded: boolean //
    private orderFailed: boolean //

    // They need some sort of armored vehicle via which to
    // transport the treasure once they've acquired it. They
    // find one, paint a racing stripe on it, and call it
    // STRIPE.
    private stripe: any
    private elements: any
    private card: any
    // private savedCard: any
    private cards: any[]



    constructor(
        private ui: UiService,
        private cartService: CartService,
        private checkoutService: CheckoutService,
        private organizationService: OrganizationService,
        private userService: UserService,
        private formBuilder: FormBuilder,
        private mteFormBuilder: MteFormBuilderService,
    ) {}

    public ngOnInit(): void {
        this.ui.setTitle('Checkout')

        this.checkoutForm = this.mteFormBuilder.create({
            firstName: {
                label: 'First name',
                defaultValue: '',
            },
            lastName: {
                label: 'Last name',
                defaultValue: '',
                validators: [ Validators.required ]
            },
            email: {
                label: 'Email',
                defaultValue: '',
                validators: [ Validators.email, Validators.required ],
            }
        })
        this.checkoutFormGroup = this.checkoutForm.formGroup

        this.cartService.carts.subscribe(cart => {
            this.cart = cart
            this.populateOrder()
        })

        if (platform.isBrowser()) {
            this.stripe = (window as any).Stripe(this.checkoutService.stripeKey)
            setTimeout(() => this.initStripeForm())
        }
    }

    public initStripeForm() {
        this.elements = this.stripe.elements()
		// Create an instance of the card Element.
        this.card = this.elements.create('card', {})

		// Add an instance of the card Element into the `card-element` <div>.
        this.card.mount('#card-element')

        this.card.addEventListener('change', ({error}) => {
            const displayError = document.getElementById('card-errors')
            if (error) {
                displayError.textContent = error.message
            } else {
                displayError.textContent = ''
            }
        })
    }

    public populateOrder() {
        this.order = new OrderBuilder(this.cart.items.map(item => (<Product>item)._id))

        this.organizationService.organizations.subscribe(organization => {
            this.organization = organization

            this.order.taxPercent =
                this.organization.retailSettings.addSalesTax
                ? this.organization.retailSettings.salesTaxPercentage
                : 0

            this.order.shippingCost =
                !this.order.shippingCost && this.organization.retailSettings.shippingFlatRate
                ? this.organization.retailSettings.shippingFlatRate as Price
                : { amount: 0, currency: Currency.USD } as Price

            if (!this.order.shippingCost && this.organization.retailSettings.shippingFlatRate)
            this.order.shippingCost = this.organization.retailSettings.shippingFlatRate

            /*****************/
            /** FOR TESTING **/

            if (this.user) {
                this.user.firstName = 'Danny'
                this.user.lastName = 'Mayer'

                // this.order.customer = {
                //     userId: this.user._id,
                //     email: this.user.email,
                //     firstName: this.user.firstName,
                //     lastName: this.user.lastName,
                // }

                this.order.customer.shippingAddress = {
                    name: 'Danny Mayer',
                    street1: '1136 Prospect Ave',
                    street2: 'Apt 8',
                    city: 'Ann Arbor',
                    state: 'MI',
                    zip: '48324',
                    country: 'US',
                }
                this.order.customer.billingAddress = this.order.customer.shippingAddress
                // this.order.savePaymentInfo = true;
            }
            /*****************
            *****************/

            this.getStripeCustomer()

            if (!this.cart) return

            // this.order.products = this.cart
            // if (this.order.products && this.order.products.length) {
            //     this.productService.populateOrder(this.order, (err, order, displayOrder) => {
            //         if (err) return this.util.handleError(err)

            //         this.order = order
            //         this.displayOrder = displayOrder
            //     })
            // }
        })
    }

    public submit() {
        if (!this.order) return
        console.log(this.checkoutFormGroup)
        if (this.order.status !== OrderStatus.PreSubmitInvalid) return




        /*** Validations ***/
        /*
        if ( !this.order.customer
            || !this.order.customer.shippingAddress
            || !this.order.customer.shippingAddress.street1) {
            return this.util.handleError("Your order needs a shipping address")
        }

        if (this.savedCard) {
            this.order.stripeCard = this.savedCard
            this.processOrder()
        }
        else if (this.card) {
            stripe.createToken(this.card).then(result => {
                if (result.error) {
					// Inform the user if there was an error
                    const errorElement = document.getElementById('card-errors')
                    errorElement.textContent = result.error.message
                } else {
                    this.order.stripeToken = result.token.id
                    this.order.stripeTokenObject = result.token

                    this.processOrder()
                }
            })
        }
        else {
            this.util.flash("Enter your payment details")
        }
        */
    }

    public processOrder() {
        /*
        this.checkoutService.checkout(this.order).subscribe(
            data => {
                console.log('OUTPUT:')
                console.log(data)
                if (data.error) {
                    return this.util.handleError(data.error)
                }
                this.processingOrder = false
                this.orderSucceeded = true // Check data to make sure order was successful
                this.util.flash("Your order has been placed!", "success")
            },
            err => {
                this.processingOrder = false
                this.orderFailed = true
                this.util.handleError(err)
            },
        )
        */
    }

    public getStripeCustomer() {
        if (this.user && this.user.stripeCustomerId) {
            console.log(this.user.stripeCustomerId)
            this.checkoutService.getStripeCustomer(this.user.stripeCustomerId).subscribe(
                customer => {
                    if (customer && customer.sources) {
                        this.cards = customer.sources.data
                        this.order.customer.stripeCustomerId = customer.id
                        console.log('--- cards ---')
                        console.log(this.cards)
                    }
                },
                /*
                err => this.util.handleError("Sorry, we couldn't get your past payment details. You'll have to enter them manually."),
                */
            )
        }
    }

}
