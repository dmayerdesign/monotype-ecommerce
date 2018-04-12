import { Response } from 'express'
import { inject, injectable } from 'inversify'
import {
    controller,
    httpGet,
    interfaces,
    response,
} from 'inversify-express-utils'

import { ApiEndpoints } from '@mte/common/constants/api-endpoints'
import { Types } from '@mte/common/constants/inversify'
import { Organization } from '@mte/common/models/api-models/organization'
import { OrganizationService } from '../services/organization.service'
import { ApiController } from './api.controller'

@injectable()
@controller(ApiEndpoints.Organization)
export class OrganizationController extends ApiController implements interfaces.Controller {

    constructor(
        @inject(Types.OrganizationService) private organizationService: OrganizationService,
    ) { super() }

    @httpGet('/')
    public get(
        @response() res: Response
    ): void {
        this.handleApiResponse(this.organizationService.getOrganization(), res)
    }

    @httpGet('/create')
    public create(
        @response() res: Response
    ): void {
        this.handleApiResponse(this.organizationService.create(), res)
    }
}
