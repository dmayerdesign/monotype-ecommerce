import { ToastType } from '../../types/toast-type'

export interface IToast {
    type: ToastType
    message: string
    timeout: number
}
