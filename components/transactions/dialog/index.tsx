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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { transactionSchema } from '@/lib/validations';

const typeItems = [
  { label: 'Entrada (suma al saldo)', value: 'ENTRY' },
  { label: 'Salida (resta del saldo)', value: 'EXIT' },
];

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function NewTransactionDialog({
  master,
}: {
  master: { id: string; name: string; balance: number };
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'ENTRY',
      quantity: 1,
    },
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) form.reset();
  }

  async function onSubmit(values: TransactionFormValues) {
    // Validación rápida en el navegador; el servidor vuelve a revisar el saldo.
    if (values.type === 'EXIT' && values.quantity > master.balance) {
      form.setError('quantity', {
        message: `La salida no puede superar el saldo disponible (${master.balance}).`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, masterId: master.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? 'No fue posible crear el movimiento.');
        return;
      }
      toast.success('Movimiento registrado correctamente.');
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
            Agregar movimiento
          </Button>
        }
      />
      <DialogContent className='sm:max-w-sm'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
          <DialogHeader>
            {/* El título muestra el Maestro seleccionado en la página. */}
            <DialogTitle>{master.name}</DialogTitle>
            <DialogDescription>
              Nuevo movimiento de inventario. Saldo disponible: {master.balance}.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name='type'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='transaction-type'>Tipo de movimiento</FieldLabel>
                  <Select
                    items={typeItems}
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id='transaction-type' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {typeItems.map((item) => (
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
            <Controller
              name='quantity'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='transaction-quantity'>Cantidad</FieldLabel>
                  <Input
                    {...field}
                    id='transaction-quantity'
                    type='number'
                    min={1}
                    aria-invalid={fieldState.invalid}
                    value={Number.isNaN(field.value) ? '' : field.value}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  />
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
