'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { IconPlus } from '@tabler/icons-react';
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
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { customerSchema } from '@/lib/validations';

type CustomerFormValues = z.infer<typeof customerSchema>;

// Los cuatro campos son de texto, así que se describen en una lista y se dibujan en un map
const textFields = [
  { name: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Valentina Restrepo' },
  { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'valentina@correo.com' },
  { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '300 123 4567' },
  { name: 'address', label: 'Dirección de entrega', type: 'text', placeholder: 'Cra. 43A #1-50, Medellín' },
] as const;

export function NewCustomerDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) form.reset();
  }

  async function onSubmit(values: CustomerFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? 'No fue posible crear el cliente.');
        return;
      }
      toast.success(`Cliente ${values.name} registrado correctamente.`);
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
            <IconPlus />
            Agregar cliente
          </Button>
        }
      />
      <DialogContent className='sm:max-w-sm'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
            <DialogDescription>Datos de contacto y de entrega del cliente.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {textFields.map((textField) => (
              <Controller
                key={textField.name}
                name={textField.name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`customer-${textField.name}`}>{textField.label}</FieldLabel>
                    <Input
                      {...field}
                      id={`customer-${textField.name}`}
                      type={textField.type}
                      placeholder={textField.placeholder}
                      aria-invalid={fieldState.invalid}
                      autoComplete='off'
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            ))}
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
