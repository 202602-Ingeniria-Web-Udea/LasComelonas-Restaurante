import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { NewProductDialog } from '@/components/products/dialog';
import { ProductsTable } from '@/components/products/table';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ProductsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const products = await prisma.product.findMany({
    where: { deleted: false },
    orderBy: { codigo: 'asc' },
  });

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader title='Carta' description='Platos y bebidas que se pueden incluir en los pedidos.'>
        {/* El USER solo consulta la carta; crear productos es tarea del ADMIN. */}
        {currentUser.role === 'ADMIN' && <NewProductDialog />}
      </PageHeader>
      <Card>
        <CardContent>
          <ProductsTable products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
