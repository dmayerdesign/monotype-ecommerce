import { inject, injectable } from 'inversify'

import { Types } from '@time/common/constants/inversify'

@injectable()
export class ErrorService {
    constructor(@inject() ) {

    }

    public handleError(error) {
        console.error(error)
    }
}
