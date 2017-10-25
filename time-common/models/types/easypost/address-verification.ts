import { FieldError } from './errors'

export class VerificationDetails {
    public readonly latitude: number
    public readonly longitude: number
    public readonly time_zone: string
}

export class Verification {
    public readonly success: boolean
    public readonly errors: FieldError[]
    public readonly details: VerificationDetails
}

export class Verifications {
    public zip4: Verification
    public delivery: Verification
}
