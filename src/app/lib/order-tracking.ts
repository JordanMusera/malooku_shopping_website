export const orderStatusDescriptions = {
  pending: 'Awaiting packaging and dispatch',
  shipped: 'Your order has been dispatched and is on its way.',
  delivered: 'Your order has been delivered.',
  cancelled: 'Your order has been cancelled.',
} as const;
export type OrderStatus = keyof typeof orderStatusDescriptions;
export interface TrackingEvent { orderStatus: string; date: string; description: string; }

export function trackingForOrder(order: {
  _id: unknown; status: OrderStatus; orderDate?: Date | string; statusHistory?: TrackingEvent[];
  totalCost?: number; shippingAddress?: unknown; deliveryInfo?: unknown;
}, legacy?: { orderProgress?: TrackingEvent[] } | null) {
  // Keep existing delivery history, but take the current status and order
  // details from the same order document used by the admin dashboard.
  const events: TrackingEvent[] = [];
  for (const entry of [...(legacy?.orderProgress || []), ...(order.statusHistory || [])]) {
    if (events.at(-1)?.orderStatus !== entry.orderStatus) events.push({ orderStatus: entry.orderStatus, date: entry.date, description: entry.description });
  }
  if (!events.length && order.orderDate) events.push({ orderStatus: 'pending', date: new Date(order.orderDate).toISOString(), description: orderStatusDescriptions.pending });
  // Older orders may already have a status change without a history entry.
  // Show that saved status without inventing a timestamp for the change.
  if (events.at(-1)?.orderStatus !== order.status) events.push({ orderStatus: order.status, date: '', description: orderStatusDescriptions[order.status] });
  return { orderId: String(order._id), status: order.status, orderProgress: events, totalCost: order.totalCost, shippingAddress: order.shippingAddress, deliveryInfo: order.deliveryInfo };
}
