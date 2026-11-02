import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { transactionSchema } from '@/lib/validations';

// Al esquema del formulario se le suma el Maestro, que viene del dropdown de la página.
const createTransactionSchema = transactionSchema.extend({
  masterId: z.string().min(1, 'Selecciona un maestro.'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ADMIN y USER pueden registrar movimientos; solo se exige tener sesión.
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }

  const parsed = createTransactionSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { masterId, type, quantity } = parsed.data;

  try {
    const master = await prisma.master.findFirst({
      where: { id: masterId, deleted: false, enabled: true },
    });
    if (!master) {
      return NextResponse.json({ error: 'El maestro no existe.' }, { status: 404 });
    }
    if (type === 'EXIT' && quantity > master.balance) {
      return NextResponse.json(
        { error: `La salida supera el saldo disponible (${master.balance}).` },
        { status: 400 }
      );
    }

    // El movimiento y el nuevo saldo se guardan en una sola transacción de base de datos:
    // o se guardan los dos, o ninguno. En las salidas, la condición balance >= quantity va
    // dentro del mismo UPDATE para que dos salidas simultáneas no dejen el saldo negativo.
    const movement = await prisma.$transaction(async (database) => {
      const updated = await database.master.updateMany({
        where: type === 'EXIT' ? { id: masterId, balance: { gte: quantity } } : { id: masterId },
        data: {
          balance: type === 'ENTRY' ? { increment: quantity } : { decrement: quantity },
        },
      });
      if (updated.count === 0) return null;

      return database.transaction.create({
        data: { type, quantity, masterId, userId: currentUser.id },
      });
    });

    if (!movement) {
      return NextResponse.json(
        { error: 'La salida supera el saldo disponible.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ transaction: movement }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el movimiento', error);
    return NextResponse.json({ error: 'No fue posible crear el movimiento.' }, { status: 500 });
  }
}
