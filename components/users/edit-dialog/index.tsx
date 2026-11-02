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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
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

export function EditUserDialog({
  user,
}: {
  user: { id: string; email: string; role: 'ADMIN' | 'USER' };
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    // El dropdown arranca con el rol que el usuario tiene actualmente.
    defaultValues: {
      role: user.role,
    },
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    // Al abrir se vuelve a tomar el rol actual, por si cambió desde la última vez.
    if (isOpen) form.reset({ role: user.role });
  }

  async function onSubmit(values: EditUserFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, role: values.role }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? 'No fue posible editar el usuario.');
        return;
      }
      toast.success(`Rol de ${user.email} actualizado.`);
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
      <DialogContent className='sm:max-w-sm'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Cambia el rol asignado a este usuario.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Correo</FieldLabel>
              {/* El correo se muestra como texto: en este diálogo solo se edita el rol. */}
              <p className='font-medium break-all'>{user.email}</p>
            </Field>
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
