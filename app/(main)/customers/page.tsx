import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { NewCustomerDialog } from '@/components/customers/dialog';
import { CustomersTable } from '@/components/customers/table';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function CustomersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  // Los clientes no inician sesión porque son registros que el personal usa para tomar pedidos
  const customers = await prisma.customer.findMany({
    where: { deleted: false },
    orderBy: { name: 'asc' },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader title='Clientes' description='Personas a las que el restaurante les entrega pedidos.'>
        <NewCustomerDialog />
      </PageHeader>
      <Card>
        <CardContent>
          <CustomersTable customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
