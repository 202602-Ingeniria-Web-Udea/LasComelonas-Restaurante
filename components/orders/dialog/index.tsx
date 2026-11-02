'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { IconPlus, IconTrash } from '@tabler/icons-react';
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
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/format';
import { TAX_RATE, calculateOrderTotals } from '@/lib/orders';
import { orderSchema } from '@/lib/validations';

type OrderFormValues = z.infer<typeof orderSchema>;

export function NewOrderDialog({
  customers,
  products,
}: {
  customers: { id: string; name: string }[];
  products: { id: string; name: string; price: number }[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: '',
      items: [{ productId: '', quantity: 1 }],
    },
  });
  // useFieldArray maneja la lista de líneas del pedido (agregar y quitar productos).
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const items = useWatch({ control: form.control, name: 'items' });

  const customerItems = customers.map((customer) => ({ label: customer.name, value: customer.id }));
  const productItems = products.map((product) => ({
    label: `${product.name} · ${formatCurrency(product.price)}`,
    value: product.id,
  }));

  // Vista previa del total. Es solo informativa: el servidor recalcula todo con sus precios.
  const previewLines = items.map((item) => ({
    price: products.find((product) => product.id === item.productId)?.price ?? 0,
    quantity: Number.isNaN(item.quantity) ? 0 : item.quantity,
  }));
  const totals = calculateOrderTotals(previewLines);

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) form.reset();
  }

  async function onSubmit(values: OrderFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Solo se envían ids y cantidades, nunca precios.
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? 'No fue posible crear el pedido.');
        return;
      }
      toast.success('Pedido creado. Queda pendiente de pago.');
      handleOpenChange(false);
      router.refresh();
    } catch {
      toast.error('No fue posible conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }

  const itemsError = form.formState.errors.items?.root ?? form.formState.errors.items;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type='button'>
            <IconPlus />
            Nuevo pedido
          </Button>
        }
      />
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-lg'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Nuevo pedido</DialogTitle>
            <DialogDescription>Elige el cliente y agrega los productos de la carta.</DialogDescription>
          </DialogHeader>
          <FieldGroup className='gap-5'>
            <Controller
              name='customerId'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='order-customer'>Cliente</FieldLabel>
                  <Select
                    items={customerItems}
                    name={field.name}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? '')}
                  >
                    <SelectTrigger id='order-customer' className='w-full'>
                      <SelectValue placeholder='Selecciona un cliente' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {customerItems.map((item) => (
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

            <div className='flex flex-col gap-3'>
              <span className='text-sm font-medium'>Productos</span>
              {fields.map((line, index) => (
                <div key={line.id} className='flex items-start gap-2'>
                  <Controller
                    name={`items.${index}.productId`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='min-w-0 flex-1'>
                        <Select
                          items={productItems}
                          name={field.name}
                          value={field.value || null}
                          onValueChange={(value) => field.onChange(value ?? '')}
                        >
                          <SelectTrigger className='w-full' aria-label={`Producto ${index + 1}`}>
                            <SelectValue placeholder='Selecciona un producto' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {productItems.map((item) => (
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
                    name={`items.${index}.quantity`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='w-20 shrink-0'>
                        <Input
                          {...field}
                          type='number'
                          min={1}
                          max={50}
                          aria-label={`Cantidad del producto ${index + 1}`}
                          aria-invalid={fieldState.invalid}
                          value={Number.isNaN(field.value) ? '' : field.value}
                          onChange={(event) => field.onChange(event.target.valueAsNumber)}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    aria-label={`Quitar producto ${index + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              ))}
              {itemsError?.message && <FieldError>{itemsError.message}</FieldError>}
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-fit'
                onClick={() => append({ productId: '', quantity: 1 })}
              >
                <IconPlus />
                Agregar otro producto
              </Button>
            </div>
          </FieldGroup>

          <div className='grid gap-1 rounded-lg bg-muted p-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Subtotal</span>
              <span className='tabular-nums'>{formatCurrency(totals.subTotalAmount)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>
                Impoconsumo ({Math.round(TAX_RATE * 100)} %)
              </span>
              <span className='tabular-nums'>{formatCurrency(totals.taxAmount)}</span>
            </div>
            <Separator className='my-1' />
            <div className='flex justify-between font-semibold'>
              <span>Total</span>
              <span className='tabular-nums'>{formatCurrency(totals.totalAmount)}</span>
            </div>
          </div>

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
              {isLoading ? 'Creando...' : 'Crear pedido'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
