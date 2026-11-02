import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { paymentSchema } from '@/lib/validations';

const createPaymentSchema = paymentSchema.extend({
  orderId: z.string().min(1, 'Falta el pedido.'),
});

// Pago simulado: no se conecta a ninguna pasarela ni se piden datos de tarjetas.
// Solo se registra el método con el que pagó el cliente.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }

  const parsed = createPaymentSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { orderId, method } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'El pedido no existe.' }, { status: 404 });
    }
    if (order.status !== 'PENDING' || order.payment) {
      return NextResponse.json(
        { error: 'Este pedido ya tiene un pago registrado.' },
        { status: 400 }
      );
    }

    // El pago se crea y el pedido pasa a PAID en la misma operación. El monto es el total
    // calculado por el servidor al crear el pedido.
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        payment: {
          create: { amount: order.totalAmount, method, status: 'COMPLETED' },
        },
      },
    });
    return NextResponse.json({ order: updatedOrder }, { status: 201 });
  } catch (error) {
    console.error('Error al registrar el pago', error);
    return NextResponse.json({ error: 'No fue posible registrar el pago.' }, { status: 500 });
  }
}
