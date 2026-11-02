import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { orderSchema } from '@/lib/validations';
import {
  CANCELABLE_STATUSES,
  NEXT_STATUS,
  calculateOrderTotals,
  type OrderStatus,
} from '@/lib/orders';

const updateOrderSchema = z.object({
  orderId: z.string().min(1, 'Falta el pedido.'),
  action: z.enum(['advance', 'cancel'], { error: 'Acción no válida.' }),
});

// Crea un pedido. ADMIN y USER pueden hacerlo.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }

  const parsed = orderSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { customerId, items } = parsed.data;

  // Si el mismo producto se agregó en dos líneas, se suman sus cantidades.
  const quantityByProduct = new Map<string, number>();
  for (const item of items) {
    quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity);
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, deleted: false, enabled: true },
    });
    if (!customer) {
      return NextResponse.json({ error: 'El cliente no existe.' }, { status: 404 });
    }

    // Los precios se leen de la base de datos: nunca se usan los que manda el navegador.
    const products = await prisma.product.findMany({
      where: { id: { in: [...quantityByProduct.keys()] }, deleted: false, enabled: true },
    });
    if (products.length !== quantityByProduct.size) {
      return NextResponse.json(
        { error: 'Uno de los productos ya no está disponible en la carta.' },
        { status: 400 }
      );
    }

    const lines = products.map((product) => ({
      productId: product.id,
      price: product.price,
      quantity: quantityByProduct.get(product.id) ?? 0,
    }));
    const totals = calculateOrderTotals(lines);

    const order = await prisma.order.create({
      data: {
        customerId,
        status: 'PENDING',
        ...totals,
        orderItems: { create: lines },
      },
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el pedido', error);
    return NextResponse.json({ error: 'No fue posible crear el pedido.' }, { status: 500 });
  }
}

// Avanza el pedido al siguiente estado o lo cancela.
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }

  const parsed = updateOrderSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { orderId, action } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'El pedido no existe.' }, { status: 404 });
    }
    const currentStatus = order.status as OrderStatus;

    if (action === 'cancel') {
      if (!CANCELABLE_STATUSES.includes(currentStatus)) {
        return NextResponse.json(
          { error: 'Este pedido ya no se puede cancelar.' },
          { status: 400 }
        );
      }
      // Si el pedido ya estaba pagado, el pago se marca como reembolsado.
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELED',
          payment: order.payment ? { update: { status: 'REFUNDED' } } : undefined,
        },
      });
      return NextResponse.json({ order: updatedOrder }, { status: 200 });
    }

    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) {
      const message =
        currentStatus === 'PENDING'
          ? 'Primero registra el pago del pedido.'
          : 'Este pedido ya no puede avanzar.';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });
    return NextResponse.json({ order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el pedido', error);
    return NextResponse.json({ error: 'No fue posible actualizar el pedido.' }, { status: 500 });
  }
}
