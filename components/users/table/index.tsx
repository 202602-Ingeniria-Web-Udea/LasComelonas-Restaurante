import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditUserDialog } from '@/components/users/edit-dialog';
import { formatDate, shortId } from '@/lib/format';

type UserRow = {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
};

export function UsersTable({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Fecha de creación</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead className='text-right'>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length ? (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className='font-mono text-xs' title={user.id}>
                {shortId(user.id)}
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell className='font-medium'>
                {[user.name, user.lastName].filter(Boolean).join(' ')}
                {user.id === currentUserId && (
                  <span className='ml-1 text-xs text-muted-foreground'>(tú)</span>
                )}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                </Badge>
              </TableCell>
              <TableCell className='text-right'>
                <EditUserDialog user={user} />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
              No hay usuarios.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
