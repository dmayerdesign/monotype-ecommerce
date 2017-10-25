/**
 * Parent class for Easypost resources
 *
 * @export
 * @class Resource
 */
export abstract class Resource {
    public readonly id: string
    public readonly object: string
}

export abstract class TimestampedResource extends Resource {
    /** @member {string} created_at Is an ISO string */
    public readonly created_at: string
    /** @member {string} updated_at Is an ISO string */
    public readonly updated_at: string
}
