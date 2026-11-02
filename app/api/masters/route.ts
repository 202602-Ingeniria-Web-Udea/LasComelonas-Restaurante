import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { masterSchema } from '@/lib/validations';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // El rol se verifica aquí también: ocultar el botón en la página no basta.
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }
  if (currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Solo un administrador puede crear maestros.' },
      { status: 403 }
    );
  }

  const parsed = masterSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, initialBalance } = parsed.data;

  try {
    // El saldo inicial se registra también como un primer movimiento de entrada.
    // Así la suma de los movimientos siempre coincide con el saldo y la gráfica arranca bien.
    const master = await prisma.master.create({
      data: {
        name,
        balance: initialBalance,
        createdById: currentUser.id,
        transactions:
          initialBalance > 0
            ? { create: { type: 'ENTRY', quantity: initialBalance, userId: currentUser.id } }
            : undefined,
      },
    });
    return NextResponse.json({ master }, { status: 201 });
  } catch (error) {
    // P2002 es el código de Prisma para un valor único repetido (aquí, el nombre).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un maestro con ese nombre.' }, { status: 409 });
    }
    console.error('Error al crear el maestro', error);
    return NextResponse.json({ error: 'No fue posible crear el maestro.' }, { status: 500 });
  }
}
