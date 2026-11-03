import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  profile: { image: string } | null;
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
          users.map((user) => {
            const fullName = [user.name, user.lastName].filter(Boolean).join(' ');
            const image = user.profile?.image ?? '';
            return (
              <TableRow key={user.id}>
                <TableCell className='font-mono text-xs' title={user.id}>
                  {shortId(user.id)}
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-2'>
                    {/* La foto del perfil; si no hay, se muestran las iniciales. */}
                    <Avatar size='sm'>
                      {image && <AvatarImage src={image} alt={fullName} />}
                      <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>
                      {fullName}
                      {user.id === currentUserId && (
                        <span className='ml-1 text-xs text-muted-foreground'>(tú)</span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <EditUserDialog
                    user={{
                      id: user.id,
                      email: user.email,
                      name: user.name,
                      lastName: user.lastName ?? '',
                      image,
                      role: user.role,
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })
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