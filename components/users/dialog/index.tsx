'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { IconUserPlus } from '@tabler/icons-react';
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import { userSchema } from '@/lib/validations';

type UserFormValues = z.infer<typeof userSchema>;

// Campos de texto del formulario. No hay registro público: solo el ADMIN crea usuarios.
const textFields = [
  { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Hana', description: '' },
  { name: 'lastName', label: 'Apellido', type: 'text', placeholder: 'Tanaka', description: '' },
  { name: 'email', label: 'Correo', type: 'email', placeholder: 'hana@sakuraya.com', description: '' },
  {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    placeholder: '',
    description: 'Mínimo 8 caracteres. Se guarda cifrada.',
  },
  {
    name: 'image',
    label: 'Foto (URL)',
    type: 'url',
    placeholder: 'https://...',
    description: 'Opcional. Si se deja vacía, se muestran las iniciales.',
  },
] as const;

export function NewUserDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: '',
      role: 'USER',
      image: '',
    },
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) form.reset();
  }

  async function onSubmit(values: UserFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? 'No fue posible crear el usuario.');
        return;
      }
      toast.success(`Usuario ${values.email} creado correctamente.`);
      handleOpenChange(false);
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
          <Button type='button'>
            <IconUserPlus />
            Crear usuario
          </Button>
        }
      />
      {/* max-h y overflow permiten desplazar el formulario en pantallas pequeñas. */}
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-md'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>Crea una cuenta para un miembro del personal.</DialogDescription>
          </DialogHeader>
          <FieldGroup className='gap-5'>
            {textFields.map((textField) => (
              <Controller
                key={textField.name}
                name={textField.name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`user-${textField.name}`}>{textField.label}</FieldLabel>
                    <Input
                      {...field}
                      id={`user-${textField.name}`}
                      type={textField.type}
                      placeholder={textField.placeholder}
                      aria-invalid={fieldState.invalid}
                      autoComplete={textField.type === 'password' ? 'new-password' : 'off'}
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
                  <FieldLabel htmlFor='user-role'>Rol</FieldLabel>
                  <Select
                    items={ROLE_ITEMS}
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id='user-role' className='w-full'>
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
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Spinner />}
              {isLoading ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
