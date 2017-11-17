import { Organization } from '../api-models/organization'

export interface IEmailOptions {
    organization?: Organization
    fromName: string
    fromEmail: string
    toName?: string
    toEmail: string
    subject: string
    preheader?: string
    html?: string
    text?: string
}
