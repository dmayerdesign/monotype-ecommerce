import { inject, injectable } from 'inversify'

import { Types } from '@time/common/constants/inversify'
import { EmailService } from './email.service'

@injectable()
export class ErrorService {
    constructor(@inject(Types.EmailService) private emailService: EmailService) { }

    public handleError(error: Error) {
        console.error(error)
        this.emailService.reportError(error)
    }
}
