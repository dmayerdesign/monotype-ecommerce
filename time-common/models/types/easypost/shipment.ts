import { Address } from './address'
import { Form } from './form'
import { TimestampedResource } from './resource'
// import { Address } from './address'
// import { CustomsInfo } from './customs-info'
// import { Parcel } from './parcel'
// import { ScanForm } from './scan-form'

/**
 * An Easypost Shipment
 *
 * {@link https://www.easypost.com/docs/api.html#shipments Easypost#shipments}
 * @export
 * @class Shipment
 * @extends {Resource}
 */
export class Shipment extends TimestampedResource {
    public readonly object = "Shipment"
    public reference?: string
    public readonly mode?: 'test' | 'production'
    public to_address: Address
    public from_address: Address
    public return_address?: Address
    public buyer_address?: Address
    public parcel: any /* Parcel */
    public customs_info?: any /* CustomsInfo */
    public scan_form?: any /* ScanForm */
    public forms?: Form[]
    public insurance?: any /* Insurance */
    public rates?: any[] /* Rate[] */
    public selected_rate: any /* Rate */
    public postage_label: any /* PostageLabel */
    public messages?: any[] /* Message[] */
    public options?: any /* ShipmentOptions */
    public is_return?: boolean
    public tracking_code?: boolean
    public usps_zone?: string
    public readonly status?: string
    public readonly tracker?: any /* Tracker */
    public fees?: any[] /* Fee[] */
    public refund_status?: 'submitted' | 'refunded' | 'rejected'
    public batch_id?: string
    public batch_status?: string
    public batch_message?: string
}
