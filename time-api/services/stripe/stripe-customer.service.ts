import { injectable } from 'inversify'
import * as Stripe from 'stripe'
import { InstanceType } from 'typegoose'

import { Order } from '@time/common/models/api-models/order'
import { User, UserModel } from '@time/common/models/api-models/user'
import { ApiErrorResponse } from '@time/common/models/helpers/api-error-response'
import { ApiResponse } from '@time/common/models/helpers/api-response'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

/**
 * Stripe service
 *
 * @export
 * @class StripeService
 * @description Methods for interacting with the Stripe API
 */
@injectable()
export class StripeCustomerService {

    /**
     * If the customer checked "save payment info," create a Stripe Customer
     *
     * @param {Order} order - The order from which the customer's information is being collected
     */
    public createCustomer(order: Order) {
        return new Promise<StripeNode.customers.ICustomer>(async (resolve, reject) => {
            if (order.customer.userId && order.savePaymentInfo && order.stripeTokenObject && order.stripeTokenObject.card) {
                let user: InstanceType<User>
                try {
                    user = await UserModel.findById(order.customer.userId)
                }
                catch (findUserError) {
                    reject(findUserError)
                }
                if (!user) return resolve(null)

                console.log('************  The Customer  *************')
                console.log(order.customer)

                // this.addCard(order.stripeToken, customer.id, (_err, card) => {
                // 	if (_err) return done(_err);
                // 	order.stripeTokenObject.card.id = card.id;

                if (order.customer.stripeCustomerId) {
                    try {
                        const customer = await stripe.customers.retrieve(order.customer.stripeCustomerId)
                        if (customer) {
                            console.log(customer)
                            resolve(customer)
                        } else {
                            createCustomer()
                        }
                    }
                    catch (retrieveStripeCustomerError) {
                        reject(retrieveStripeCustomerError)
                    }
                } else {
                    createCustomer()
                }

                async function createCustomer() {
                    try {
                        const customer = await stripe.customers.create({
                            source: order.stripeToken,
                            email: order.customer.email,
                        })
                        if (!customer) return reject(new Error("Couldn't create the customer in Stripe"))

                        console.log("New customer")
                        console.log(customer)

                        user.stripeCustomerId = customer.id
                        await user.save()
                        resolve(customer)
                    }
                    catch (error) {
                        reject(error)
                    }
                }

                // });
            } else {
                reject(new Error("The order did not contain sufficient data to create a customer in Stripe."))
            }
        })
    }

    /**
     * Add a card to the Stripe customer
     *
     * @param {string} source - The tokenized card
     * @param {string} stripeCustomerId - The Stripe customer's ID
     */
    public addCard(tokenID: string, stripeCustomerId: string) {
        return new Promise<ApiResponse<StripeNode.cards.ICard>>(async (resolve, reject) => {
            try {
                const card = await stripe.customers.createSource(stripeCustomerId, { source: tokenID })
                resolve(new ApiResponse(<StripeNode.cards.ICard>card))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    /**
     * Get a Stripe customer
     *
     * @param {string} stripeCustomerId - The Stripe customer's ID
     */
    public getCustomer(customerID: string) {
        return new Promise<ApiResponse<StripeNode.customers.ICustomer>>(async (resolve, reject) => {
            try {
                const customer = await stripe.customers.retrieve(customerID)
                resolve(new ApiResponse(<StripeNode.customers.ICustomer>customer))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    /**
     * Update a Stripe customer
     *
     * @param {string} stripeCustomerId - The Stripe customer's ID
     * @param {object} updateObj - An object containing the values to be updated (@see https://stripe.com/docs/api/node#update_customer)
     */
    public updateCustomer(stripeCustomerId: string, updateObj: object) {
        return new Promise<ApiResponse<StripeNode.customers.ICustomer>>(async (resolve, reject) => {
            try {
                const customer = await stripe.customers.update(stripeCustomerId, updateObj)
                resolve(new ApiResponse(<StripeNode.customers.ICustomer>customer))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }

    /**
     * Update the customer's default card
     *
     * @param {string} stripeCustomerId - The Stripe customer's ID
     * @param {string} stripeCardID - The ID of the Stripe source, usually a card (*not* a single-use token)
     * @example `card_19rzdy2eZvKYlo2CzJQXXiuV`
     */
    public updateCustomerDefaultSource(stripeCustomerId: string, stripeCardID: string) {
        return new Promise<ApiResponse<StripeNode.customers.ICustomer>>(async (resolve, reject) => {
            try {
                const customer = await stripe.customers.update(stripeCustomerId, { default_source: stripeCardID })
                resolve(new ApiResponse(<StripeNode.customers.ICustomer>customer))
            }
            catch (error) {
                reject(new ApiErrorResponse(error))
            }
        })
    }
}
