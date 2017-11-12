import { inject, injectable } from 'inversify'
const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN })

import { Types } from '@time/common/constants/inversify'
import { OrderService } from './order.service'

/**
 * Send emails with Mailgun
 */
export class EmailService {
    constructor(
        @inject(Types.OrderService) private orderService: OrderService
    ) {}

    /**
     * Send an email
     *
     * @param {IEmailOptions} options
     */
    public sendEmail(options) {
        return new Promise<any>((resolve, reject) => {

            const mailOptions: any = {
            to: options.toEmail,
            from: `${options.fromName} <${options.fromEmail}>`,
            subject: options.subject,
            }

            if (options.html) {
                mailOptions.html = options.html
            }
            else if (options.text) {
                mailOptions.text = options.text
            }

            mailgun.messages().send(mailOptions, (err, body) => {
                if (err) return reject(err)
                resolve(body)
            })
        })
    }

    /**
     * Send a receipt
     *
     * @param {Email} options
     * @param {Order} options.order
     */
    public sendReceipt(options) {
        options.subject = options.subject || `Your receipt | ${options.store.name}`
        options.preheader = options.preheader || `View your receipt from your recent order`

        console.log(options)

        options.html = this.emailFactory.createReceipt(options)
        return this.sendEmail(options)
    }

    /**
     * Send a shipping notification
     *
     * @param {Email} options
     * @param {Order} options.order
     */
    public sendShippingNotification(options) {
        options.subject = options.subject || `Your ${options.store.name} order has been shipped`
        options.preheader = options.preheader || `It's on the way! View the shipping details from your recent order`
        options.estArrivalDate = this.orderService.calculateEstArrival(options.order.estDeliveryDays)

        options.html = this.emailFactory.createShippingNotification(options)
        return this.sendEmail(options)
    }

    /**
     * Send an email verification
     *
     * @param {Email} options
     * @param {User} options.user
     * @param {string} options.verificationCode
     */
    public sendEmailVerification(options) {
        options.subject = options.subject || `Verify your new ${options.store.name} account`
        options.preheader = options.preheader || `One click, and your account will be verified`

        options.html = this.emailFactory.createEmailVerification(options)
        return this.sendEmail(options)
    }

    /**
     * Report an error
     *
     * @param {Error} error
     */
    public reportError(error: Error) {
        const options: IEmailOptions = {

        }
    }

}
