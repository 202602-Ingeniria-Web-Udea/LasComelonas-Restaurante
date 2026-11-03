'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { IconPencil } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { ROLE_ITEMS } from '@/lib/roles';
import { editUserSchema } from '@/lib/validations';

type EditUserFormValues = z.infer<typeof editUserSchema>;

type EditableUser = {
  id: string;
  email: string;
  name: string;
  lastName: string;
  image: string;
  role: 'ADMIN' | 'USER';
};

const textFields = [
  { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Hana', description: '' },
  { name: 'lastName', label: 'Apellido', type: 'text', placeholder: 'Tanaka', description: '' },
  {
    name: 'image',
    label: 'Foto (URL)',
    type: 'url',
    placeholder: 'https://...',
    description: 'Enlace directo a la imagen. Si se deja vacía, se muestran las iniciales.',
  },
] as const;

function getCurrentValues(user: EditableUser): EditUserFormValues {
  return {
    name: user.name,
    lastName: user.lastName,
    image: user.image,
    role: user.role,
  };
}

export function EditUserDialog({ user }: { user: EditableUser }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: getCurrentValues(user),
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) form.reset(getCurrentValues(user));
  }

  async function onSubmit(values: EditUserFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, ...values }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? 'No fue posible editar el usuario.');
        return;
      }
      toast.success(`Usuario ${user.email} actualizado.`);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('No fue posible conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type='button' variant='outline' size='sm'>
            <IconPencil />
            Editar usuario
          </Button>
        }
      />
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-md'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Cambia el nombre, la foto o el rol de este usuario.</DialogDescription>
          </DialogHeader>
          <FieldGroup className='gap-5'>
            <Field>
              <FieldLabel>Correo</FieldLabel>
              <p className='font-medium break-all'>{user.email}</p>
            </Field>
            {textFields.map((textField) => (
              <Controller
                key={textField.name}
                name={textField.name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`edit-${textField.name}-${user.id}`}>
                      {textField.label}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`edit-${textField.name}-${user.id}`}
                      type={textField.type}
                      placeholder={textField.placeholder}
                      aria-invalid={fieldState.invalid}
                      autoComplete='off'
                    />
                    {textField.description && (
                      <FieldDescription>{textField.description}</FieldDescription>
                    )}
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            ))}
            <Controller
              name='role'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`role-${user.id}`}>Rol</FieldLabel>
                  <Select
                    items={ROLE_ITEMS}
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={`role-${user.id}`} className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        {ROLE_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={isLoading}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Spinner />}
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}