import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { NewOrderDialog } from '@/components/orders/dialog';
import { OrdersTable } from '@/components/orders/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6'>
        {statusSummary.map((item) => (
          <Card key={item.status} size='sm'>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
            <CardContent className='text-2xl font-semibold tabular-nums'>{item.count}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los pedidos</CardTitle>
          <CardDescription>
            Flujo: pendiente de pago → pagado → listo → en camino → entregado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
