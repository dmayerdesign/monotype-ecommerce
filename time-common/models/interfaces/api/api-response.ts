import { HttpStatus } from '../../../constants/http'

export interface IApiResponse<T> {
    data: T
    status: HttpStatus
}
