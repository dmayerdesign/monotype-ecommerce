import { ToastType } from '../../enums/toast-type'

export interface IToast {
    type: ToastType
    message: string
    timeout: number
}
