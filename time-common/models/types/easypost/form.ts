import { TimestampedResource } from './resource'

export class Form extends TimestampedResource {
    public readonly object = "Form"
    public readonly mode: 'test' | 'production'
    public form_type: 'commercial_invoice' // Should always be 'commercial_invoice'
    public form_url: string
    public readonly submitted_electronically: boolean
}
