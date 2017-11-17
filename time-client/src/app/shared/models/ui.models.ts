export type FlashMessageType = 'success'|'error'|'info'|'warn'

export interface IFlash {
    type: string
    message: string
    timeout?: number
}
