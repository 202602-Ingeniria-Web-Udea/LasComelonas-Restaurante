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
  if (currentUser.role !== 'ADMIN') redirect('/orders');

  const users = await prisma.user.findMany({
    where: { deleted: false },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      profile: { select: { image: true } },
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