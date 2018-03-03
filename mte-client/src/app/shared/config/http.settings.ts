import { IHttpSettings } from '@mte/common/ng-modules/http'

export class HttpSettings extends IHttpSettings {
    public static httpFlashErrorBlacklist: { endpoint: string, method: string }[] = [
        { endpoint: '/api/organization', method: 'GET' }
    ]
}
