import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

import { OrderBuilder } from '@time/common/builders/order.builder'
import { Cart } from '@time/common/models/api-models/cart'
import { Organization } from '@time/common/models/api-models/organization'
import { Product } from '@time/common/models/api-models/product'
import { User } from '@time/common/models/api-models/user'
import { Currency } from '@time/common/models/enums/currency'
import { IPrice } from '@time/common/models/interfaces/api/price'
import { TimeFormBuilderService } from '@time/common/ng-modules/forms/services/form-builder.service'
import { TimeFormBuilder } from '@time/common/ng-modules/forms/utilities/form.builder'
import { CartService, OrganizationService, UserService, UtilService } from '../../../shared/services'
import { CheckoutService } from '../../services/checkout.service'

let stripe

@Component({
    selector: 'checkout',
    templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {

    public checkoutFormGroup: FormGroup
    public checkoutForm: TimeFormBuilder

    private user: User
    // private stripeCustomer: any
    private order: OrderBuilder
    private organization: Organization
    // private displayOrder: Product[]
    private cart: Cart
    private elements: any
    private card: any
    // private savedCard: any
    private cards: any[]
    // private processingOrder: boolean
    // private orderSucceeded: boolean
    // private orderFailed: boolean

    constructor(
        private util: UtilService,
        private cartService: CartService,
        private checkoutService: CheckoutService,
        private organizationService: OrganizationService,
        private userService: UserService,
        private formBuilder: FormBuilder,
        private timeFormBuilder: TimeFormBuilderService,
    ) {}

    public ngOnInit(): void {
        this.util.setTitle('Checkout')

        this.checkoutForm = this.timeFormBuilder.create({
            firstName: {
                defaultValue: '',
                label: 'First name',
            },
            lastName: {
                defaultValue: '',
                label: 'Last name',
                validators: [ Validators.required ]
            },
            email: {
                defaultValue: '',
                validators: [ Validators.email, Validators.required ],
                label: 'Email',
            }
        })
        this.checkoutFormGroup = this.checkoutForm.formGroup

        this.cartService.cart$.subscribe(cart => {
            this.cart = cart
            this.populateOrder()
        })

        try {
            stripe = (window as any).Stripe(this.checkoutService.stripeKey)
            setTimeout(() => this.initStripeForm())
        }
        catch (error) { // If running on the server, the above will throw an error -- catch the error.
            console.log(error)
            return
        }
    }

    public initStripeForm() {
        this.elements = stripe.elements()
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

        this.organizationService.organization$.subscribe(organization => {
            this.organization = organization

            this.order.taxPercent =
                this.organization.retailSettings.addSalesTax
                ? this.organization.retailSettings.salesTaxPercentage
                : 0

            this.order.shippingCost =
                !this.order.shippingCost && this.organization.retailSettings.shippingFlatRate
                ? this.organization.retailSettings.shippingFlatRate as IPrice
                : { amount: 0, currency: Currency.USD } as IPrice

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

    public submitOrder() {
        // if (!this.order) return
        // if (!this.order || !this.order.products || !this.order.products.length) {
        //     return this.util.handleError("Your order doesn't have anything in it!")
        // }

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
