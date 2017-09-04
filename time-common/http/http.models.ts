export class SimpleError {
    message: string
    status: number

    constructor(error) {
        console.error(error)
        this.message = error.error
        this.status = error.status
    }
}