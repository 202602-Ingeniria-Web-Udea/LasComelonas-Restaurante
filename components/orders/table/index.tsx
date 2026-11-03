import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderActions } from '@/components/orders/actions';
import { formatCurrency, formatDateTime, shortId } from '@/lib/format';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
  type PaymentMethod,
} from '@/lib/orders';

type OrderRow = {
  id: string;
  orderDate: Date;
  totalAmount: number;
  status: OrderStatus;
  customer: { name: string };
  orderItems: { id: string; quantity: number; product: { name: string } }[];
  payment: { method: PaymentMethod; status: string } | null;
};

// Variante de Badge para cada estado, así los estados se distinguen de un vistazo.
const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING: 'outline',
  PAID: 'secondary',
  COMPLETED: 'default',
  SHIPPED: 'secondary',
  DELIVERED: 'outline',
  CANCELED: 'destructive',
};

const statusClassName: Record<OrderStatus, string> = {
  PENDING: 'border-primary/45 bg-transparent text-foreground',
  PAID: 'border-transparent bg-secondary text-secondary-foreground',
  COMPLETED: 'border-primary bg-primary text-primary-foreground',
  SHIPPED: 'border-chart-3/35 bg-chart-3/10 text-chart-3',
  DELIVERED: 'border-chart-2/35 bg-chart-2/10 text-foreground',
  CANCELED: 'border-transparent bg-muted text-muted-foreground line-through',
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pedido</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Productos</TableHead>
          <TableHead className='text-right'>Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Pago</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className='text-right'>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length ? (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className='font-mono text-xs' title={order.id}>
                #{shortId(order.id)}
              </TableCell>
              <TableCell className='font-medium'>{order.customer.name}</TableCell>
              <TableCell className='min-w-48 whitespace-normal text-muted-foreground'>
                {order.orderItems
                  .map((item) => `${item.quantity}× ${item.product.name}`)
                  .join(', ')}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatCurrency(order.totalAmount)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[order.status]} className={statusClassName[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {order.payment
                  ? `${PAYMENT_METHOD_LABELS[order.payment.method]}${
                      order.payment.status === 'REFUNDED' ? ' (reembolsado)' : ''
                    }`
                  : '—'}
              </TableCell>
              <TableCell>{formatDateTime(order.orderDate)}</TableCell>
              <TableCell className='text-right'>
                <OrderActions
                  order={{ id: order.id, status: order.status, totalAmount: order.totalAmount }}
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className='h-24 text-center text-muted-foreground'>
              Aún no hay pedidos. Crea el primero con el botón &quot;Nuevo pedido&quot;.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
