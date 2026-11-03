import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { NewOrderDialog } from '@/components/orders/dialog';
import { OrdersTable } from '@/components/orders/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/orders';
import { prisma } from '@/lib/prisma';

export default async function OrdersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const [orders, customers, products] = await Promise.all([
    prisma.order.findMany({
      orderBy: { orderDate: 'desc' },
      include: {
        customer: { select: { name: true } },
        orderItems: { include: { product: { select: { name: true } } } },
        payment: { select: { method: true, status: true } },
      },
    }),
    // Solo clientes y productos activos se pueden elegir en un pedido nuevo.
    prisma.customer.findMany({
      where: { deleted: false, enabled: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      where: { deleted: false, enabled: true },
      orderBy: { codigo: 'asc' },
      select: { id: true, name: true, price: true },
    }),
  ]);

  // Cantidad de pedidos en cada estado, para el resumen de arriba.
  const statusSummary = ORDER_STATUSES.map((status) => ({
    status,
    label: ORDER_STATUS_LABELS[status],
    count: orders.filter((order) => order.status === status).length,
  }));

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Pedidos'
        description='Registra pedidos, cobra y sigue cada entrega hasta la puerta del cliente.'
      >
        <NewOrderDialog customers={customers} products={products} />
      </PageHeader>

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6'>
        {statusSummary.map((item) => (
          <div
            key={item.status}
            className={`summary-label flex min-h-20 flex-col justify-between border-l-2 px-3 py-2 ${
              item.status === 'DELIVERED'
                ? 'border-l-chart-2'
                : item.status === 'CANCELED'
                  ? 'border-l-muted-foreground'
                  : item.status === 'SHIPPED'
                    ? 'border-l-chart-3'
                    : 'border-l-primary'
            }`}
          >
            <span className='text-[0.65rem] font-medium tracking-[0.12em] text-muted-foreground uppercase'>{item.label}</span>
            <span className='font-heading text-2xl tabular-nums'>{item.count}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
