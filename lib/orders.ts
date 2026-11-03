// Reglas de negocio de los pedidos, compartidas por el servidor y por los componentes.

export type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'CASH';

// Impuesto al consumo de restaurantes en Colombia (8 %). Es el único lugar donde se define.
export const TAX_RATE = 0.08;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente de pago',
  PAID: 'Pagado',
  COMPLETED: 'Listo',
  SHIPPED: 'En camino',
  DELIVERED: 'Entregado',
  CANCELED: 'Cancelado',
};

// Orden en que se muestran los estados en el resumen de la página de pedidos.
export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'COMPLETED',
  'SHIPPED',
  'DELIVERED',
  'CANCELED',
];

// Siguiente estado de cada pedido. PENDING no aparece porque solo avanza al registrar el pago.
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: 'COMPLETED',
  COMPLETED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

// Texto del botón que lleva el pedido a su siguiente estado.
export const NEXT_STATUS_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  PAID: 'Marcar como listo',
  COMPLETED: 'Enviar a domicilio',
  SHIPPED: 'Marcar como entregado',
};

// Un pedido solo se puede cancelar antes de salir del restaurante.
export const CANCELABLE_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'COMPLETED'];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  CREDIT_CARD: 'Tarjeta de crédito',
  DEBIT_CARD: 'Tarjeta de débito',
  PAYPAL: 'PayPal',
};

// Calcula subtotal, impuesto y total. El impuesto se redondea porque el peso no usa centavos.
export function calculateOrderTotals(lines: { price: number; quantity: number }[]) {
  const subTotalAmount = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const taxAmount = Math.round(subTotalAmount * TAX_RATE);
  return { subTotalAmount, taxAmount, totalAmount: subTotalAmount + taxAmount };
}
