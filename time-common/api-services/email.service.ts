import { EmailFactory } from '../emails/index';
require('dotenv').config();
const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

/**
 * Send emails with Mailgun
 */
export class EmailService {
	constructor() {
		this.emailFactory = new EmailFactory();
	}

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
	sendEmail(options, done) {
		console.log(options);

		let mailOptions = {
		  to: options.toEmail,
		  from: `${options.fromName} <${options.fromEmail}>`,
		  subject: options.subject,
		};

		if (options.html) {
			mailOptions.html = options.html;
		}
		else if (options.text) {
			mailOptions.text = options.text;
		}

		mailgun.messages().send(mailOptions, done);
	}

	/**
	 * Send a receipt
	 *
	 * @param {Email} options
	 * @param {Order} options.order
	 */
	sendReceipt(options, done) {
		options.subject = options.subject || `Your receipt | ${options.store.name}`;
		options.preheader = options.preheader || `View your receipt from your recent order`;

		console.log(options);

		options.html = this.emailFactory.createReceipt(options);
		this.sendEmail(options, done);
	}

	/**
	 * Send a shipping notification
	 *
	 * @param {Email} options
	 * @param {Order} options.order
	 */
	sendShippingNotification(options, done) {
		options.subject = options.subject || `Your ${options.store.name} order has been shipped`;
		options.preheader = options.preheader || `It's on the way! View the shipping details from your recent order`;
		options.estArrivalDate = this.emailFactory.calculateEstArrival(options.order.estDeliveryDays);

		options.html = this.emailFactory.createShippingNotification(options);
        this.sendEmail(options, done);
	}

	/**
	 * Send an email verification
	 *
	 * @param {Email} options
	 * @param {User} options.user
	 * @param {string} options.verificationCode
	 */
	sendEmailVerification(options, done) {
		options.subject = options.subject || `Verify your new ${options.store.name} account`;
		options.preheader = options.preheader || `One click, and your account will be verified`;

		options.html = this.emailFactory.createEmailVerification(options);
		this.sendEmail(options, done);
	}

}
