import { TimestampedResource } from './resource'

export class Rate extends TimestampedResource<'Rate'> {
    public readonly mode: 'test' | 'production' /* "test" or "production" */
    public readonly service: string /* service level/name */
    public readonly carrier: string /* name of carrier */
    public readonly carrier_account_id: string /* ID of the CarrierAccount record used to generate this rate */
    public readonly shipment_id: string /* ID of the Shipment this rate belongs to */
    public readonly rate: string /* the actual rate quote for this service */
    public readonly currency: string /* currency for the rate */
    public readonly retail_rate: string /* the retail rate is the in-store rate given with no account */
    public readonly retail_currency: string /* currency for the retail rate */
    public readonly list_rate: string /* the list rate is the non-negotiated rate given for having an account with the carrier */
    public readonly list_currency: string /* currency for the list rate */
    public readonly delivery_days: number /* delivery days for this service */
    public readonly delivery_date: string /* date for delivery */
    public readonly delivery_date_guaranteed: boolean /* indicates if delivery window is guaranteed (true) or not (false) */
    public readonly est_delivery_days?: number /* This field is deprecated and should be ignored. */
}
