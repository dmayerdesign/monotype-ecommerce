import { ToastType } from '../../enums/toast-type'

export interface Toast {
    type: ToastType
    message: string
   timeout: number
}
