import { HttpStatus } from '../../constants/http'

export interface IServiceResponse<T> {
    data: T,
    status: HttpStatus
}
