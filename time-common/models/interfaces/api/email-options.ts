import { Order } from '../../api-models/order'
import { Organization } from '../../api-models/organization'

export interface IEmailStyleOptions {
    mastheadBgColor: string
    accentColor: string
    fontFamily: string
    innerBgColor: string
}

export interface IEmailServiceOptions {
    fromName?: string
    fromEmail?: string
    toName?: string
    toEmail: string
    subject?: string
    preheader?: string
    html?: string
    text?: string
    organization?: Organization
}

export interface IEmailOptions {
    fromName: string
    fromEmail: string
    toName?: string
    toEmail: string
    subject: string
    preheader?: string
    html?: string
    text?: string
    organization?: Organization
}

export interface IOrderEmailOptions extends IEmailServiceOptions {
    order?: Order
}
