import { inject, injectable } from 'inversify'
import * as Stripe from 'stripe'

import { appConfig } from '@time/app-config'
import { EmailService } from '@time/common/api-services'
import { Types } from '@time/common/constants/inversify'
import { Order, Organization, Product, User } from '@time/common/models/api-models'
import { StripeOrder } from '@time/common/models/helpers'
import { IApiResponse, IDiscount, IOrder, IProduct } from '@time/common/models/interfaces'
import { DiscountService } from './discount.service'
import { ProductService } from './product.service'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

/**
 *
 * Methods for interacting with the Stripe API
 *
 */
@injectable()
export class StripeService {

    constructor(
        @inject(Types.EmailService) private email: EmailService,
        @inject(Types.ProductService) private productService: ProductService,
        @inject(Types.DiscountService) private discountService: DiscountService
    ) {}

    private createOrder(order: IOrder) {
        return new Promise<{ order: IOrder; stripeOrder: StripeOrder }>(async (resolve, reject) => {
            let orderItems: IProduct[]
            let orderDiscounts: IDiscount[]

            if (!order.total
                || !order.total.currency
                || !order.customer.email) {
                reject(new Error("Not a valid order"))
            }

            order.total.amount = 0

            try {
                const orderItemsResponse = await <Promise<IApiResponse<IProduct[]>>>this.productService.get({ _id: { $in: order.items } }, { page: 1, limit: order.items.length })
                orderItems = orderItemsResponse.data
                orderItems.forEach(orderItem => {
                    order.total.amount += this.productService.getPrice(orderItem).total
                })
            }
            catch (getItemsError) {
                reject(getItemsError)
            }

            try {
                const orderDiscountsResponse = await <Promise<IApiResponse<IDiscount[]>>>this.discountService.get({ _id: { $in: order.discounts } })
                orderDiscounts = orderDiscountsResponse.data
                orderDiscounts.forEach(orderDiscount => {
                    order.total.amount -= orderDiscount.amount.total
                })
            }
            catch (getDiscountsError) {
                reject(getDiscountsError)
            }

            const dbOrder = new Order(order)

            // Build the stripe order
            const stripeOrder = new StripeOrder()

            stripeOrder.shipping = {
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
            stripeOrder.currency = order.total.currency
            stripeOrder.customer = order.stripeCustomerId
            stripeOrder.email = order.customer.email
            stripeOrder.items = orderItems.map(product => {
                return <StripeNode.orders.IOrderItem>{
                    parent: product.SKU,
                    quantity: product.stockQuantity,
                }
            })

            console.log(`
    ----------------------------
            The Stripe order
    ----------------------------`)
            console.log(stripeOrder)

            stripe.orders.create(<StripeNode.orders.IOrderCreationOptions>stripeOrder)
                .then(newStripeOrder => {
                    dbOrder.stripeOrderId = newStripeOrder.id
                    dbOrder.save()
                        .then(newOrder => {
                            resolve({
                                order: newOrder,
                                stripeOrder: <StripeOrder>newStripeOrder
                            })
                        })
                        .catch(orderCreationError => {
                            reject(orderCreationError)
                        })
                })
                .catch(stripeOrderCreationError => {
                    reject(stripeOrderCreationError)
                })
        })
    }

    private payOrder(order, done) {
        const payment: StripeNode.orders.IOrderPayOptions = {
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
            stripe.orders.pay(order.stripeOrderId, payment)
                .then(stripeOrder => {
                    Order.findById(order._id)
                        .then(dbOrder => {
                            dbOrder.status = 'Paid'
                            dbOrder.save((error, updatedOrder) => {
                                done(error, updatedOrder, stripeOrder)
                            })
                        })
                        .catch(error => done(error))
                })
                .catch(error => done(error))
        }
    }

    private createProductsOrSKUs(which, products, order) {
        return new Promise<{ products: Array<IProduct>; stripeProductsOrSKUs: Array<StripeNode.products.IProduct|StripeNode.skus.ISku> }>((resolve, reject) => {
            const productsToAdd = []
            let outOfStock = false

            if (!products || !products.length) {
                resolve({
                    products: [],
                    stripeProductsOrSKUs: [],
                })
                return
            }

            products.forEach(product => {
                if (product.stockQuantity < 1 && product.stockQuantity !== -1) {
                    outOfStock = true
                }
            })

            if (outOfStock) {
                reject(new Error("Oh no — one of your chosen items is out of stock!"))
                return
            }

            if (products.every(product => product.enteredIntoStripe)) {
                resolve({
                    products,
                    stripeProductsOrSKUs: [],
                })
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

            this.createStripeProductsOrSKUs(which, productsToAdd)
                .then(stripeProductsOrSKUs => {
                    const query = { SKU: { $in: [] } }
                    if (!stripeProductsOrSKUs) return resolve({
                        products,
                        stripeProductsOrSKUs: [],
                    })

                    products.forEach(product => {
                        if (!product.enteredIntoStripe) {
                            query.SKU.$in.push(product.SKU)
                        }
                    })

                    Product
                        .update(
                            query,
                            {
                                $set: { enteredIntoStripe: true },
                            },
                            { multi: true })
                        .then(updatedProducts => {
                            resolve({
                                products: updatedProducts,
                                stripeProductsOrSKUs,
                            })
                        })
                        .catch(updateProductsError => {
                            reject(updateProductsError)
                        })
                })
                .catch(() => {
                    resolve({
                        products,
                        stripeProductsOrSKUs: [],
                    })
                })
        })
    }

    private createStripeProductsOrSKUs(which, products) {
        return new Promise<Array<StripeNode.products.IProduct|StripeNode.skus.ISku>>((resolve, reject) => {
            recursivelyCreateProductsOrSKUs(products)

            function recursivelyCreateProductsOrSKUs(productArr) {
                const stripeProducts = {
                    products: [],
                    skus: [],
                }

                console.log(`*********** Creating a ${which.substring(0, which.length - 1)} ************`)
                console.log(productArr)
                console.log(productArr[0])

                stripe[which].create(productArr[0])
                .then(product => {
                    const logMsg = which === "skus" ? "SKU" : "product"
                    console.log(`
        -------------------------------------
            Created the ${logMsg} in Stripe
        -------------------------------------`)
                    console.log(product.id)

                    stripeProducts[which].push(product)
                    productArr.shift()

                    if (productArr.length) {
                        recursivelyCreateProductsOrSKUs(productArr)
                    }
                    else {
                        resolve(stripeProducts[which])
                    }
                })
                .catch(error => {
                    if (error.message.indexOf("already exists") > -1) {
                        return resolve(stripeProducts[which])
                    }
                    reject(error)
                })
            }
        })
    }

    private updateInventory(products, order) {
        products.forEach(product => {
            let qty = 0
            if (product.isParent) {
                const variations = products.map(p => p.parentSKU === product.SKU)
                const variationSKUs = variations.map(v => v.SKU)
                const orderVariations = order.items.filter(op => variationSKUs.indexOf(op.SKU) > -1)
                orderVariations.forEach(ov => qty += ov.quantity)
            }
            else {
                qty = order.items.find(op => op.SKU === product.SKU).quantity
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
    public submitOrder(orderData, variationsAndStandalones, done) {
        return new Promise<{ order: IOrder, stripeOrder: StripeOrder }>(async (resolve, reject) => {
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
                order.customer.stripeCustomerId = stripeCustomer.id

                // Pay the order
                const { paidOrder, paidStripeOrder } = await this.payOrder(order)

                // Update the stock quantity and total sales of each variation and standalone




                resolve({ order: paidOrder, stripeOrder: paidStripeOrder })

            }
            catch (error) {
                reject(error)
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
                                $order.stripeCustomer = stripeCustomer
                                this.payOrder($order, ($err, dbOrder, _stripeOrder) => {
                                    // ==========================================================
                                    console.log("payOrder")
                                    if ($err) return done($err)
                                    this.updateInventory(products, dbOrder)
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
    public createProducts(products) {
        return this.createProductsOrSKUs("products", products, null)
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
