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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { masterSchema } from '@/lib/validations';

type MasterFormValues = z.infer<typeof masterSchema>;

export function NewMasterDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<MasterFormValues>({
    resolver: zodResolver(masterSchema),
    defaultValues: {
      name: '',
      initialBalance: 0,
    },
  });

  // Al cerrar el diálogo se limpia el formulario para la próxima vez.
  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) form.reset();
  }

  async function onSubmit(values: MasterFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/masters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? 'No fue posible crear el maestro.');
        return;
      }
      toast.success(`Maestro "${values.name}" creado correctamente.`);
      handleOpenChange(false);
      // Vuelve a ejecutar la página de servidor para que la tabla muestre el nuevo registro.
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
            Agregar
          </Button>
        }
      />
      <DialogContent className='sm:max-w-sm'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Nuevo maestro</DialogTitle>
            <DialogDescription>
              Registra un insumo de la cocina. Incluye la unidad en el nombre, por ejemplo
              &quot;Arroz para sushi (kg)&quot;.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='master-name'>Nombre</FieldLabel>
                  <Input
                    {...field}
                    id='master-name'
                    aria-invalid={fieldState.invalid}
                    placeholder='Alga nori (hojas)'
                    autoComplete='off'
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name='initialBalance'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='master-balance'>Saldo inicial</FieldLabel>
                  <Input
                    {...field}
                    id='master-balance'
                    type='number'
                    min={0}
                    aria-invalid={fieldState.invalid}
                    // Los inputs entregan texto; valueAsNumber lo convierte a número para zod.
                    value={Number.isNaN(field.value) ? '' : field.value}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  />
                  <FieldDescription>
                    Se registra como el primer movimiento de entrada del maestro.
                  </FieldDescription>
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
