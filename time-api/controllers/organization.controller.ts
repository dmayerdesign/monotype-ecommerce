import { injectable } from 'inversify'
import {
    controller,
    httpGet,
    interfaces,
} from 'inversify-express-utils'

import { IOrganization } from '@time/common/models/interfaces/api/organization'

@injectable()
@controller('/api/organization')
export class OrganizationController implements interfaces.Controller {

    constructor(
        // @inject(TYPES.ProductService) private organizationService: OrganizationService,
    ) {}

    @httpGet('/')
    public get(): Promise<IOrganization> {
        // return this.organizationService.get()
        const testOrg: any = {
            name: "Hyzer Shop",
            retailSettings: {
                salesTaxPercentage: 6,
            },
        }
        return new Promise<IOrganization>(resolve => {
            resolve(testOrg)
        })
    }
}
