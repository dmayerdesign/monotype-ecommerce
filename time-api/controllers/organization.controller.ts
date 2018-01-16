import { Response } from 'express'
import { inject, injectable } from 'inversify'
import {
    controller,
    httpGet,
    interfaces,
    response,
} from 'inversify-express-utils'

import { Endpoints } from '@time/common/constants/endpoints'
import { Types } from '@time/common/constants/inversify'
import { Organization } from '@time/common/models/api-models/organization'
import { OrganizationService } from '../services/organization.service'
import { ApiController } from './api.controller'

@injectable()
@controller(Endpoints.Organization)
export class OrganizationController extends ApiController implements interfaces.Controller {

    @inject(Types.OrganizationService) private organizationService: OrganizationService

    @httpGet('/')
    public get(
        @response() res: Response
    ): void {
        this.handleApiResponse(this.organizationService.getOrganization(), res)
    }
}
