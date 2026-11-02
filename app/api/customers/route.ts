import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { customerSchema } from '@/lib/validations';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Cualquier miembro del personal (ADMIN o USER) puede registrar clientes
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }

  const parsed = customerSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.create({ data: parsed.data });
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un cliente con ese correo.' }, { status: 409 });
    }
    console.error('Error al crear el cliente', error);
    return NextResponse.json({ error: 'No fue posible crear el cliente.' }, { status: 500 });
  }
}
