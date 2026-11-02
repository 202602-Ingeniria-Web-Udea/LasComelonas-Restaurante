'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { IconArrowRight, IconX } from '@tabler/icons-react';
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
import { Spinner } from '@/components/ui/spinner';
import { PaymentDialog } from '@/components/orders/payment-dialog';
import { shortId } from '@/lib/format';
import {
  CANCELABLE_STATUSES,
  NEXT_STATUS_ACTION_LABELS,
  type OrderStatus,
} from '@/lib/orders';

// Botones de cada fila de la tabla de pedidos. Solo aparecen las acciones válidas
// para el estado actual; de todas formas el servidor vuelve a validar cada cambio.
export function OrderActions({
  order,
}: {
  order: { id: string; status: OrderStatus; totalAmount: number };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);

  const nextActionLabel = NEXT_STATUS_ACTION_LABELS[order.status];
  const canCancel = CANCELABLE_STATUSES.includes(order.status);

  async function updateOrder(action: 'advance' | 'cancel') {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? 'No fue posible actualizar el pedido.');
        return;
      }
      toast.success(action === 'cancel' ? 'Pedido cancelado.' : 'Estado del pedido actualizado.');
      setIsCancelOpen(false);
      router.refresh();
    } catch {
      toast.error('No fue posible conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }

  if (order.status === 'PENDING' || nextActionLabel || canCancel) {
    return (
      <div className='flex justify-end gap-2'>
        {order.status === 'PENDING' && (
          <PaymentDialog orderId={order.id} totalAmount={order.totalAmount} />
        )}
        {nextActionLabel && (
          <Button size='sm' disabled={isLoading} onClick={() => updateOrder('advance')}>
            {isLoading ? <Spinner /> : <IconArrowRight />}
            {nextActionLabel}
          </Button>
        )}
        {canCancel && (
          <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
            <DialogTrigger
              render={
                // Botón solo con ícono para que la tabla quepa en pantallas medianas.
                <Button
                  size='icon-sm'
                  variant='destructive'
                  disabled={isLoading}
                  aria-label='Cancelar pedido'
                  title='Cancelar pedido'
                >
                  <IconX />
                </Button>
              }
            />
            <DialogContent className='sm:max-w-sm'>
              <DialogHeader>
                <DialogTitle>¿Cancelar el pedido #{shortId(order.id)}?</DialogTitle>
                <DialogDescription>
                  {order.status === 'PENDING'
                    ? 'El pedido quedará cancelado y no se podrá reactivar.'
                    : 'El pedido ya está pagado: el pago quedará marcado como reembolsado.'}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant='outline'
                  disabled={isLoading}
                  onClick={() => setIsCancelOpen(false)}
                >
                  Volver
                </Button>
                <Button variant='destructive' disabled={isLoading} onClick={() => updateOrder('cancel')}>
                  {isLoading && <Spinner />}
                  Sí, cancelar pedido
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Pedidos entregados o cancelados ya no tienen acciones.
  return <span className='text-xs text-muted-foreground'>Sin acciones</span>;
}
