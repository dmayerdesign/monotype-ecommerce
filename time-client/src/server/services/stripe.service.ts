import { inject, injectable } from 'inversify'
import * as Stripe from 'stripe'

import { appConfig } from '@time/app-config'
import { EmailService } from '@time/common/api-services'
import { Types } from '@time/common/constants/inversify'
import { Organization, Product } from '@time/common/models/api-models'
import { IProduct } from '@time/common/models/interfaces'
// import { Order } from '@time/common/models/order'
// import { User } from '@time/common/models/user'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

/**
 *
 * Methods for interacting with the Stripe API
 *
 */
@injectable()
export class StripeService {

    constructor(
        @inject(Types.EmailService) private email: EmailService
    ) {}

    private createOrder(order): Promise<{ order: IOrder, stripeOrder: StripeNode.orders.IOrder }> {
        return new Promise<{ order: IOrder, stripeOrder: StripeNode.orders.IOrder }>((resolve, reject) => {
            if (!order.total
                || !order.total.currency
                || !order.customer.email) {
                return done("Not a valid order")
            }

            order.total.amount = 0
            order.products.forEach(orderProduct => {
                order.total.amount += orderProduct.totalCost
            })

            const dbOrder = new Order(order)
            const stripeOrder = {}

            const setOrderProperty = (key, prop) => {
                let props
                if (prop.indexOf(".") > -1) {
                    props = prop.split(".")
                    if (props.length === 2)
                        stripeOrder[key] = order[props[0]][props[1]]
                    if (props.length === 1)
                        stripeOrder[key] = order[props[0]]
                    return
                }
                if (order[prop]) {
                    stripeOrder[key] = order[prop]
                }
            }

            order.items = order.products.map(product => {
                return {
                    parent: product.SKU,
                    quantity: product.quantity,
                }
            })

            order.shipping = {
                name: order.customer.firstName + ' ' + order.customer.lastName,
                address: {
                    line1: order.customer.shippingAddress.street1,
                    line2: order.customer.shippingAddress.street2,
                    city: order.customer.shippingAddress.city,
                    state: order.customer.shippingAddress.state,
                    country: order.customer.shippingAddress.country,
                    postal_code: order.customer.shippingAddress.zip,
                },
            }

            setOrderProperty('currency', 'total.currency')
            setOrderProperty('customer', 'stripeCustomerId')
            setOrderProperty('email', 'customer.email')
            setOrderProperty('items', 'items')
            setOrderProperty('shipping', 'shipping')

            console.log(`
    ----------------------------
            The Stripe order
    ----------------------------`)
            console.log(stripeOrder)

            stripe.orders.create(stripeOrder, (err, newOrder) => {
                if (err) return done(err)

                dbOrder.stripeOrderId = newOrder.id
                dbOrder.save((err, _order) => {
                    done(err, _order, newOrder)
                })
            })
        })
    }

    private payOrder(order, done) {
        const payment = {
            metadata: {
                orderID: order._id.toString(),
            },
        }
        console.log("******** order.stripeToken ********")
        console.log(order.stripeToken)

        if (order.customer.stripeCustomerId && !order.stripeToken && !order.stripeCard) {
            payment.customer = order.customer.stripeCustomerId
        }
        else if ((order.stripeToken || order.stripeCard) && order.customer.email) {
            payment.source = order.stripeToken || order.stripeCard.id
            payment.email = order.customer.email
        }
        else {
            return done("Missing one of: Stripe Customer ID, Stripe Token ID, or email")
        }

        if (order.savePaymentInfo && order.stripeToken && order.customer.stripeCustomerId) {
            delete payment.source
            delete payment.email
            payment.customer = order.customer.stripeCustomerId

            console.log("******** Saving new card ********")
            stripe.customers.createSource(order.customer.stripeCustomerId, { source: order.stripeToken }, (err, card) => {
                if (err || !card) return done("Couldn't save your payment info. Please try again.")
                stripe.customers.update(order.customer.stripeCustomerId, { default_source: card.id }, (_err, customer) => {
                    if (err) return done(err)
                    makePayment()
                })
            })
        } else {
            makePayment()
        }

        function makePayment() {
            stripe.orders.pay(order.stripeOrderId, payment, (err, stripeOrder) => {
                if (err) return done(err)

                Order.findById(order._id, (err, dbOrder) => {
                    if (err) return done(err)
                    dbOrder.status = 'Paid'
                    dbOrder.save((error, updatedOrder) => {
                        done(error, updatedOrder, stripeOrder)
                    })
                })
            })
        }
    }

    private createProductsOrSKUs(which, products, order, done) {
        const productsToAdd = []
        let outOfStock = false

        if (!products || !products.length) {
            done(null, [], [])
            return
        }

        products.forEach(product => {
            if (product.stockQuantity < 1 && product.stockQuantity !== -1) {
                outOfStock = true
            }
        })

        if (outOfStock) {
            done("Oh no — one of your chosen items is out of stock!")
            return
        }

        if (products.every(product => product.enteredIntoStripe)) {
            done(null, products, [])
            return
        }

        if (which === "products") {
            console.log("Let's make some products")
            console.log(products)
            products.forEach(product => {
                const productId = product.isStandalone ? product.SKU + "_parent" : product.SKU
                if (!product.enteredIntoStripe && !product.isVariation) {
                    productsToAdd.push({
                        id: productId,
                        name: product.name,
                        attributes: ["_id"],
                    })
                }
            })
        }
        else if (which === "skus") {
            console.log("Let's make some SKUs")
            products.forEach(product => {
                console.log(product)
                const thePrice = this.determinePrice(product)
                const productToAdd: any = {
                    id: product.SKU,
                    price: thePrice * 100,
                    currency: order.total.currency || "usd",
                    inventory: {
                        quantity: product.stockQuantity,
                        type: "finite",
                    },
                    attributes: {
                        "_id": product._id.toString(),
                    },
                }
                if (!product.enteredIntoStripe && !product.isParent) {
                    productToAdd.product = product.isStandalone ? product.SKU + "_parent" : product.parentSKU
                    productsToAdd.push(productToAdd)
                }
            })
        }

        console.log(productsToAdd)

        this.createStripeProductsOrSKUs(which, productsToAdd, (err, stripeProducts) => {
            const query = { SKU: { $in: [] } }
            if (err || !stripeProducts) return done(null, products, [])

            products.forEach(product => {
                if (!product.enteredIntoStripe) {
                    query.SKU.$in.push(product.SKU)
                }
            })

            Product.update(
                query,
                {
                    $set: { enteredIntoStripe: true },
                },
                { multi: true },
                (_err, updatedProducts) => {
                    done(_err, updatedProducts, stripeProducts)
                })
        })
    }

    private createStripeProductsOrSKUs(which, productArr, cb) {
        const stripeProducts = {
            products: [],
            skus: [],
        }

        console.log(`*********** Creating a ${which.substring(0, which.length - 1)} ************`)
        console.log(productArr)
        console.log(productArr[0])

        stripe[which].create(productArr[0], (err, product) => {
            if (err) {
                if (err.message.indexOf("already exists") > -1) {
                    return cb(null, stripeProducts[which])
                }
                return cb(err)
            }
            const logMsg = which === "skus" ? "SKU" : "product"
            console.log(`
-------------------------------------
    Created the ${logMsg} in Stripe
-------------------------------------`)
            console.log(product.id)

            stripeProducts[which].push(product)
            productArr.shift()

            if (productArr.length) {
                this.createStripeProductsOrSKUs(which, productArr, cb)
            }
            else {
                cb(null, stripeProducts[which])
            }
        })
    }

    private updateProducts(products, order) {
        products.forEach(product => {
            let qty = 0
            if (product.isParent) {
                const variations = products.map(p => p.parentSKU === product.SKU)
                const variationSKUs = variations.map(v => v.SKU)
                const orderVariations = order.products.filter(op => variationSKUs.indexOf(op.SKU) > -1)
                orderVariations.forEach(ov => qty += ov.quantity)
            }
            else {
                qty = order.products.find(op => op.SKU === product.SKU).quantity
            }
            Product.update({SKU: product.SKU}, { $inc: { stockQuantity: -qty, totalSales: qty } }, console.log)
        })
    }

    private determinePrice(product) {
        if (product.onSale && product.salePrice) {
            return product.salePrice
        }
        else if (product.price) {
            return product.price
        }
        return 0
    }

    /**
     * Submit an order. Creates an order in Stripe, and immediately pays it
     *
     * @param {IOrder} orderData An object representing the order to be created and paid
     * @param {array<Product>} variationsAndStandalones Products from the database representing the variations and standalone products purchased
     * @param {function} done A callback function taking three arguments: an error (null if the
     * order was successful), the updated database Order, and the returned Stripe Order object
     */
    public async submitOrder(orderData, variationsAndStandalones, done): Promise<{ order: IOrder, stripeOrder: StripeNode.orders.IOrder }> {
        const parentSKUs = []
        const productSKUs = []
        variationsAndStandalones.forEach(product => {
            productSKUs.push(product.SKU)
            if (product.isVariation && product.parentSKU) {
                parentSKUs.push(product.parentSKU)
                productSKUs.push(product.parentSKU)
            }
        })

        try {
            // Retrieve parent products and combine them with `variationsAndStandalones` into `products`
            // Use the new `products` array to create the products and SKUs in Stripe, if they don't exist
            const parents = await Product.find({ SKU: { $in: parentSKUs } })
            const products = parents.concat(variationsAndStandalones)
            const stripeProducts = await this.createProducts(products)
            console.log("Created products")
            const stripeSKUs = await this.createSKUs(products, orderData)
            console.log("Created SKUs")

            // Create the order in Stripe
            const { order, stripeOrder } = await this.createOrder(orderData)
            // Create the customer in Stripe
            const stripeCustomer = await this.createCustomer(order)
            // Update the order with the Stripe customer info
            order.stripeCustomer = stripeCustomer
            order.customer.stripeCustomerId = stripeCustomer.id
            // Pay the order
            const { paidOrder, paidStripeOrder }

        }

        Product.find({ SKU: { $in: parentSKUs } }, (error, parents) => {
            if (error) return done(error)
            const products = parents.concat(variationsAndStandalones)
            this.createProducts(products, ($error, stripeProducts) => {
                console.log("createProducts")
                if ($error) return done($error)
                this.createSKUs(products, order, (_err, stripeSKUs) => {
                    console.log("createSKUs")
                    if (_err) return done(_err)
                    this.createOrder(order, (err, _order, stripeOrder) => {
                        console.log("createOrder")
                        if (err) return done(err)
                        this.createCustomer(_order, (_error, stripeCustomer, $order) => {
                            console.log("createCustomer")
                            if (_error) return done(_error)
                            // ==========================================================
                            $order.stripeCustomer = stripeCustomer
                            this.payOrder($order, ($err, dbOrder, _stripeOrder) => {
                                console.log("payOrder")
                                if ($err) return done($err)
                                this.updateProducts(products, dbOrder)
                                Organization.findOne({}, (_error_, organization) => {
                                    if (_error_) return done(_error_)
                                    console.log("Sending receipt")
                                    this.email.sendReceipt({
                                        organization,
                                        order: dbOrder,
                                        fromEmail: appConfig.organization_email,
                                        fromName: appConfig.organization_name,
                                        toEmail: dbOrder.customer.email,
                                        toName: dbOrder.customer.firstName + ' ' + dbOrder.customer.lastName,
                                    }, (_$error, body) => {
                                        console.log("<<<<<<<<<< RECEIPT >>>>>>>>>>")
                                        console.log(_$error, body)
                                        done(_$error, dbOrder, _stripeOrder)
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    }

    /**
     * If the customer checked "save payment info," create a Stripe Customer
     *
     * @param {Order} order - The order from which the customer's information is being collected
     * @param {function} done - A callback function taking three arguments: an error (null if the
     * creation was successful), the returned Stripe Customer object, and the updated order
     */
    public createCustomer(order, done) {
        if (order.customer.userId && order.savePaymentInfo && order.stripeTokenObject && order.stripeTokenObject.card) {
            User.findById(order.customer.userId, (err, user) => {
                if (err) return done(err)
                if (!user) return done(null, null, order)

                console.log('************  The Customer  *************')
                console.log(order.customer)

                // this.addCard(order.stripeToken, customer.id, (_err, card) => {
                // 	if (_err) return done(_err);
                // 	order.stripeTokenObject.card.id = card.id;

                if (order.customer.stripeCustomerId) {
                    stripe.customers.retrieve(
                        order.customer.stripeCustomerId,
                        (customerErr, customer) => {
                            if (customerErr) return done(customerErr)
                            if (customer) {
                                console.log(customer)
                                done(null, customer, order)
                            } else {
                                createCustomer()
                            }
                        }
                    )
                } else {
                    createCustomer()
                }

                function createCustomer() {
                    stripe.customers.create({
                        source: order.stripeToken,
                        email: order.customer.email,
                    }, (error, customer) => {
                        if (error) return done(error)
                        if (!customer) return done("Couldn't create the customer in Stripe")

                        console.log("New customer")
                        console.log(customer)

                        user.stripeCustomerId = customer.id
                        user.save(_error => {
                            done(_error, customer, order)
                        })
                    })
                }


                // });

            })
        } else {
            done(null, null, order)
        }
    }

    /**
     * Add a card to the Stripe customer
     *
     * @param {string} source - The tokenized card
     * @param {Customer} stripeCustomerId - The Stripe customer's ID
     * @param {function} done - A callback function taking two arguments: an error (null if the
     * addition was successful) and an object representing the newly added card
     */
    public addCard(tokenID, stripeCustomerId, done) {
        stripe.customers.createSource(stripeCustomerId, { source: tokenID }, done) // err, card
    }

    /**
     * Get a Stripe customer
     *
     * @param {string} stripeCustomerId - The Stripe customer's ID
     * @param {function} done - A callback function taking two arguments: an error (null if the
     * retrieval was successful) and the customer object
     */
    public getCustomer(customerID, done) {
        stripe.customers.retrieve(customerID, done)
    }

    /**
     * Update a Stripe customer
     *
     * @param {string} stripeCustomerId - The Stripe customer's ID
     * @param {object} updateObj - An object containing the values to be updated (@see 'https://stripe.com/docs/api/node#update_customer')
     * @param {function} done - A callback function taking two arguments: an error (null if the
     * addition was successful) and an object representing the updated customer
     */
    public updateCustomer(stripeCustomerId, updateObj, done) {
        stripe.customers.update(stripeCustomerId, updateObj, done) // err, customer
    }

    /**
     * Update the customer's default card
     *
     * @param {string} stripeCustomerId - The Stripe customer's ID
     * @param {string} stripeCardID - The ID of the Stripe source, usually a card (*not* a single-use token)
     * @example `card_19rzdy2eZvKYlo2CzJQXXiuV`
     * @param {function} done - A callback function taking two arguments: an error (null if the
     * update was successful) and an object representing the updated customer
     */
    public updateCustomerDefaultSource(stripeCustomerId, stripeCardID, done) {
        stripe.customers.update(stripeCustomerId, { default_source: stripeCardID }, done) // err, customer
    }

    /**
     * Create Parent and Standalone products in Stripe
     *
     * @param {array<Product>} products - Array of Parent and Standalone products to add to Stripe
     * @param {function} done - A callback function taking two arguments: an error (null if the
     * creation was successful) and an array of the returned Stripe Product objects
     */
    public createProducts(products, done) {
        return this.createProductsOrSKUs("products", products, null, done)
    }

    /**
     * Create SKUs in Stripe
     *
     * @param {array<Product>} products - Array of Standalone products and product Variations to add to Stripe
     * @param {Order} order - The order containing references to the products being added
     * @param {function} done - A callback function taking two arguments: an error (null if the
     * creation was successful) and an array of the returned Stripe SKU objects
     */
    public createSKUs(products, order, done) {
        return this.createProductsOrSKUs("skus", products, order, done)
    }

    /**
     * Get the Stripe Publishable Key
     *
     * @returns {string} STRIPE_PUBLISHABLE_KEY
     */
    public getPublishableKey() {
        return process.env.STRIPE_PUBLISHABLE_KEY
    }

}
