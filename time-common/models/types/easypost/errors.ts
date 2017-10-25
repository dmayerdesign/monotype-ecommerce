export class FieldError {
    public readonly field: string
    public readonly message: string
}

export class Error {
    public readonly code: string
    public readonly message: string
    public readonly errors: FieldError[]
}
