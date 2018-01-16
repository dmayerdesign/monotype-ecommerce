import { AppConfig } from '../../app-config'
import { Order } from '../models/api-models/order'
import { Organization } from '../models/api-models/organization'
import { IEmailOptions, IEmailStyleOptions, IOrderEmailOptions } from '../models/interfaces/api/email-options'

export class EmailBuilder {

    private _options: IEmailOptions = {
        fromEmail: AppConfig.organization_email,
        fromName: AppConfig.brand_name,
        toEmail: null,
        toName: null,
        subject: null,
        preheader: null,
    }

    private html: string

    private styles: IEmailStyleOptions = {
        mastheadBgColor: '#00b0ff',
        accentColor: '#ff3c7c',
        fontFamily: 'Montserrat',
        innerBgColor: '#fdfdfd',
    }

    private commonData: {
        order?: Order
        organization?: Organization
    }

    private customData: any = {}

    public setOptions(options?: IOrderEmailOptions): this {
        if (options) {
            // Email options
            if (typeof options.fromEmail !== 'undefined') this._options.fromEmail = options.fromEmail
            if (typeof options.fromName !== 'undefined') this._options.fromName = options.fromName
            if (typeof options.toEmail !== 'undefined') this._options.toEmail = options.toEmail
            if (typeof options.toName !== 'undefined') this._options.toName = options.toName
            if (typeof options.subject !== 'undefined') this._options.subject = options.subject
            if (typeof options.preheader !== 'undefined') this._options.preheader = options.preheader

            // Common data
            if (typeof options.order !== 'undefined') this.commonData.order = options.order
            if (typeof options.organization !== 'undefined') this.commonData.organization = options.organization
        }
        return this
    }

    public setCustomData(data: any): this {
        this.customData = data
        return this
    }

    public setHtml(pugModule: (options: IEmailOptions) => string): this {
        this.html = pugModule(this.createEmailOptions)
        return this
    }

    private get createEmailOptions(): any {
        return {
            ...this._options,
            ...this.styles,
            ...this.commonData,
            ...this.customData,
        }
    }

    public get sendEmailOptions(): IEmailOptions {
        return {
            ...this._options,
            html: this.html,
        }
    }
}
