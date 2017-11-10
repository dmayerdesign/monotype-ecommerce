export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Received' | 'Cancelled' | 'Refunded' | 'Returned'

export class OrderStatusEnum {
    public static readonly Pending = 'Pending'
    public static readonly Paid = 'Paid'
    public static readonly Shipped = 'Shipped'
    public static readonly Received = 'Received'
    public static readonly Cancelled = 'Cancelled'
    public static readonly Refunded = 'Refunded'
    public static readonly Returned = 'Returned'
}
