import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { NewMasterDialog } from '@/components/masters/dialog';
import { MastersTable } from '@/components/masters/table';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function MastersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  // Las páginas son componentes de servidor y leen la base de datos directamente con Prisma.
  const masters = await prisma.master.findMany({
    where: { deleted: false },
    orderBy: { name: 'asc' },
    include: { createdBy: { select: { name: true, lastName: true } } },
  });

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Maestros'
        description='Insumos de la cocina y su saldo actual en inventario.'
      >
        {/* Solo el ADMIN ve el botón; la API también rechaza a los demás roles. */}
        {currentUser.role === 'ADMIN' && <NewMasterDialog />}
      </PageHeader>
      <Card>
        <CardContent>
          <MastersTable masters={masters} />
        </CardContent>
      </Card>
    </div>
  );
}
