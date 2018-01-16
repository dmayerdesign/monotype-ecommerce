import { Response } from 'express'
import { injectable } from 'inversify'

import { ApiResponse } from '@time/common/models/api-responses/api.response'

@injectable()
export class ApiController<T = any> {
    public handleApiResponse(method: Promise<ApiResponse<T>>, res: Response): void {
        method
            .then(({data, status}) => res.status(status).json(data))
            .catch(({message, status}) => res.status(status).json({message, status}))
    }
}
