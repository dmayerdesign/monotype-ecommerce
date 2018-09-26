import { EmailOptions, EmailServiceOptions, OrderEmailOptions } from '@mte/common/api/interfaces/email-options'
import { EmailService } from '../../interfaces/email-service'

export class EmailServiceStub implements EmailService {
    public async sendEmail(_options: EmailOptions): Promise<any> { }
    public async sendReceipt(_options: OrderEmailOptions): Promise<any> { }
    public async sendShippingNotification(_options: OrderEmailOptions): Promise<any> { }
    public async sendEmailVerification(_options: EmailServiceOptions): Promise<any> { }
    public async reportError(_error: Error): Promise<any> { }
}
