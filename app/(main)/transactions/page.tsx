import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { BalanceChart } from '@/components/transactions/chart';
import { NewTransactionDialog } from '@/components/transactions/dialog';
import { MasterSelect } from '@/components/transactions/select';
import { TransactionsTable } from '@/components/transactions/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { buildDailyBalances } from '@/lib/inventory';
import { prisma } from '@/lib/prisma';

export default async function TransactionsPage({ searchParams }: PageProps<'/transactions'>) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  // El Maestro elegido en el dropdown viaja en la URL (?masterId=...), así la página de
  // servidor puede leer sus movimientos sin pedir datos desde el navegador.
  const { masterId } = await searchParams;
  const masters = await prisma.master.findMany({
    where: { deleted: false, enabled: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, balance: true },
  });

  if (!masters.length) {
    return (
      <div className='flex flex-col gap-6'>
        <PageHeader title='Transacciones' description='Entradas y salidas de los insumos.' />
        <Card>
          <CardContent className='flex flex-col items-center gap-3 py-10 text-center'>
            <p className='text-muted-foreground'>
              Todavía no hay maestros. Primero crea un insumo en la página de Maestros.
            </p>
            <Button variant='outline' nativeButton={false} render={<Link href='/masters' />}>
              Ir a Maestros
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si la URL no trae un Maestro válido se muestra el primero de la lista.
  const selectedMaster = masters.find((master) => master.id === masterId) ?? masters[0];

  const transactions = await prisma.transaction.findMany({
    where: { masterId: selectedMaster.id },
    orderBy: { date: 'desc' },
    include: { user: { select: { name: true, lastName: true } } },
  });

  const dailyBalances = buildDailyBalances(transactions);
  const totalEntries = transactions
    .filter((transaction) => transaction.type === 'ENTRY')
    .reduce((sum, transaction) => sum + transaction.quantity, 0);
  const totalExits = transactions
    .filter((transaction) => transaction.type === 'EXIT')
    .reduce((sum, transaction) => sum + transaction.quantity, 0);

  const summary = [
    { title: 'Saldo actual', value: selectedMaster.balance },
    { title: 'Total de entradas', value: totalEntries },
    { title: 'Total de salidas', value: totalExits },
    { title: 'Movimientos', value: transactions.length },
  ];

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Transacciones'
        description='Elige un maestro para ver sus movimientos y la evolución de su saldo.'
      >
        <MasterSelect masters={masters} selectedMasterId={selectedMaster.id} />
        <NewTransactionDialog master={selectedMaster} />
      </PageHeader>

      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {summary.map((item) => (
          <Card key={item.title} size='sm'>
            <CardHeader>
              <CardDescription>{item.title}</CardDescription>
            </CardHeader>
            <CardContent className='text-2xl font-semibold tabular-nums'>{item.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saldo diario de {selectedMaster.name}</CardTitle>
          <CardDescription>Saldo al cierre de cada día, desde el primer movimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <BalanceChart data={dailyBalances} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
          <CardDescription>Del más reciente al más antiguo.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
