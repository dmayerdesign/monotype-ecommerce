import { HttpStatus } from '../../../constants/http'

export interface IApiResponse<T> {
    body: T
    status: HttpStatus
}
