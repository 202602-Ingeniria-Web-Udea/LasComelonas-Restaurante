import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { NewUserDialog } from '@/components/users/dialog';
import { UsersTable } from '@/components/users/table';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');
  // Solo el ADMIN puede entrar. Si un USER escribe la URL a mano, se le envía a Pedidos.
  if (currentUser.role !== 'ADMIN') redirect('/orders');

  const users = await prisma.user.findMany({
    where: { deleted: false },
    orderBy: { createdAt: 'asc' },
    // La contraseña nunca se envía a la página.
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader title='Usuarios' description='Personal con acceso al sistema y su rol.'>
        <NewUserDialog />
      </PageHeader>
      <Card>
        <CardContent>
          <UsersTable users={users} currentUserId={currentUser.id} />
        </CardContent>
      </Card>
    </div>
  );
}
