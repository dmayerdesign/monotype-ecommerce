import { inject, injectable } from 'inversify'

import { Types } from '../constants/inversify'
import { EmailFactory } from '../emails'
const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN})

/**
 * Send emails with Mailgun
 */
export class EmailService {
    constructor(
        @inject(Types.EmailFactory) private emailFactory: EmailFactory
    ) {}

    /**
     * Send an email
     *
     * @param {Email} options
     * @param {Store} options.store
     * @param {string} options.fromName
     * @param {string} options.fromEmail
     * @param {string} options.toName
     * @param {string} options.toEmail
     * @param {string} options.subject
     * @param {string} options.preheader
     * @param {string} options.html - Overrides 'text' if present
     * @param {string} options.text - Plain text
     * @param {string} options.bgColor
     * @param {string} options.innerBgColor
     * @param {string} options.mastheadBgColor
     * @param {string} options.fontFamily
     * @param {string} options.heading1
     * @param {string} options.subHeading
     * @param done - (error, body)
     */
    public sendEmail(options) {
        return new Promise<any>((resolve, reject) => {
            console.log(options)

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
        options.estArrivalDate = this.emailFactory.calculateEstArrival(options.order.estDeliveryDays)

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

}
