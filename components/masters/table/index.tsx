import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, shortId } from '@/lib/format';

type MasterRow = {
  id: string;
  name: string;
  balance: number;
  createdAt: Date;
  createdBy: { name: string; lastName: string | null };
};

export function MastersTable({ masters }: { masters: MasterRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead className='text-right'>Saldo</TableHead>
          <TableHead>Creado por</TableHead>
          <TableHead>Fecha de creación</TableHead>
          <TableHead className='text-right'>Movimientos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {masters.length ? (
          masters.map((master) => (
            <TableRow key={master.id}>
              <TableCell className='font-mono text-xs' title={master.id}>
                {shortId(master.id)}
              </TableCell>
              <TableCell className='font-medium'>{master.name}</TableCell>
              <TableCell className='text-right tabular-nums'>{master.balance}</TableCell>
              <TableCell>
                {[master.createdBy.name, master.createdBy.lastName].filter(Boolean).join(' ')}
              </TableCell>
              <TableCell>{formatDate(master.createdAt)}</TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='link'
                  size='sm'
                  nativeButton={false}
                  render={<Link href={`/transactions?masterId=${master.id}`} />}
                >
                  Ver movimientos
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
              Aún no hay maestros registrados.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
