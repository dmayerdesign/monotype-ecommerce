import { Response } from 'express'
import { injectable } from 'inversify'

import { ApiResponse } from '@mte/common/api/responses/api.response'

@injectable()
export class ApiController<T = any> {
    public handleApiResponse(method: Promise<ApiResponse<T>>, res: Response): void {
        method
            .then(({ body, status }) => {
                res.status(status).json(body)
            })
            .catch(({ message, status }) => {
                res.status(status).json({message, status})
            })
    }
}
