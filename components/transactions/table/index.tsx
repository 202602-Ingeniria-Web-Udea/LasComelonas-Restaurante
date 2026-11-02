import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime, shortId } from '@/lib/format';

type TransactionRow = {
  id: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  date: Date;
  user: { name: string; lastName: string | null };
};

export function TransactionsTable({ transactions }: { transactions: TransactionRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className='text-right'>Cantidad</TableHead>
          <TableHead>Responsable</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length ? (
          transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className='font-mono text-xs' title={transaction.id}>
                {shortId(transaction.id)}
              </TableCell>
              <TableCell>{formatDateTime(transaction.date)}</TableCell>
              <TableCell>
                {transaction.type === 'ENTRY' ? (
                  <Badge variant='secondary'>↓ Entrada</Badge>
                ) : (
                  <Badge variant='destructive'>↑ Salida</Badge>
                )}
              </TableCell>
              {/* Las salidas se muestran con signo negativo para leer la tabla más rápido. */}
              <TableCell className='text-right font-medium tabular-nums'>
                {transaction.type === 'ENTRY' ? '+' : '−'}
                {transaction.quantity}
              </TableCell>
              <TableCell>
                {[transaction.user.name, transaction.user.lastName].filter(Boolean).join(' ')}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
              Este maestro aún no tiene movimientos.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
