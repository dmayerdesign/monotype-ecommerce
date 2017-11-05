/**
 * Parent class for Easypost resources
 *
 * @export
 * @class Resource
 */
export abstract class Resource<T = string> {
    public readonly id: string
    public readonly object: T
}

export abstract class TimestampedResource<T = string> extends Resource<T> {
    /** @member {string} created_at Is an ISO string */
    public readonly created_at: string
    /** @member {string} updated_at Is an ISO string */
    public readonly updated_at: string
}
