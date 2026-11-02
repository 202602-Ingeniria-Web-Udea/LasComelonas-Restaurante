import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  _count: { orders: number };
};

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Dirección</TableHead>
          <TableHead className='text-right'>Pedidos</TableHead>
          <TableHead>Registrado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.length ? (
          customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className='font-medium'>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.address}</TableCell>
              <TableCell className='text-right tabular-nums'>{customer._count.orders}</TableCell>
              <TableCell>{formatDate(customer.createdAt)}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
              Aún no hay clientes registrados.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
