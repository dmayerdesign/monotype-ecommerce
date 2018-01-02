import { ModalType } from '../../enums/modal-type'

export interface IModalData {
    title: string
    type: ModalType
    form?: {
        subtitle?: string
        formObject?: object
        onSubmit?(event?: Event): void
    }
    banner?: {
        subtitle?: string
        formObject?: object
        cta?: {
            text: string
            onClick(event?: Event): void
        }
        onSubmit?(args?: any): void
    }
}
