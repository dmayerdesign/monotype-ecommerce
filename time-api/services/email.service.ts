import { Order } from '@time/common/models/api-models/order'
import { Organization } from '@time/common/models/api-models/organization'
import { inject, injectable } from 'inversify'
const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN })

import { AppConfig } from '@time/app-config'
import { EmailBuilder } from '@time/common/builders/email.builder'
import { Types } from '@time/common/constants/inversify'
import { IEmailOptions, IEmailServiceOptions, IOrderEmailOptions } from '@time/common/models/interfaces/api/email-options'
import { OrderHelper } from '../helpers/order.helper'

const receipt = require('@time/common/emails/templates/receipt')
const shippingNotification = require('@time/common/emails/templates/shippingNotification')
const emailVerification = require('@time/common/emails/templates/emailVerification')

/**
 * Send emails with Mailgun
 */
@injectable()
export class EmailService {
    constructor(
        @inject(Types.OrderHelper) private orderHelper: OrderHelper,
    ) {}

    /**
     * Send an email
     *
     * @param {IEmailOptions} options
     */
    public sendEmail(options: IEmailOptions): Promise<any> {
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
                if (err) {
                    return reject(err)
                }
                resolve(body)
            })
        })
    }

    /**
     * Send a receipt for an order
     *
     * @param {IOrderEmailOptions} options
     */
    public sendReceipt(options: IOrderEmailOptions): void {
        const emailBuilder = new EmailBuilder()
            .setOptions({
                ...options,
                subject: `Your receipt | ${options.organization.name}`,
                preheader: `View your receipt from your recent order`,
            })
            .setHtml(receipt)

        this.sendEmail(emailBuilder.sendEmailOptions)
    }

    /**
     * Send a shipping notification
     *
     * @param {IOrderEmailOptions} options
     */
    public sendShippingNotification(options: IOrderEmailOptions) {
        const emailBuilder = new EmailBuilder()
            .setOptions({
                ...options,
                subject: `Your ${options.organization.name} order has been shipped`,
                preheader: `It's on the way! View the shipping details from your recent order`,
            })
            .setCustomData({
                estArrivalDate: this.orderHelper.calculateEstArrival(options.order.estDeliveryDays),
            })
            .setHtml(shippingNotification)

        return this.sendEmail(emailBuilder.sendEmailOptions)
    }

    /**
     * Send an email verification
     *
     * @param {Email} options
     * @param {User} options.user
     * @param {string} options.verificationCode
     */
    public sendEmailVerification(options: IEmailServiceOptions) {
        const emailBuilder = new EmailBuilder()
            .setOptions({
                ...options,
                subject: `Verify your new ${options.organization.name} account`,
                preheader: `One click, and your account will be verified`,
            })
            .setHtml(emailVerification)

        return this.sendEmail(emailBuilder.sendEmailOptions)
    }

    /**
     * Report an error
     *
     * @param {Error} error
     */
    public reportError(error: Error) {
        const options: IEmailOptions = {
            toEmail: AppConfig.developer_email,
            fromName: AppConfig.brand_name,
            fromEmail: AppConfig.organization_email,
            subject: `New error from ${AppConfig.brand_name}: ${error.message}`,
            text: error.message + '\n\n' + error.toString()
        }
        return this.sendEmail(options)
    }

}
