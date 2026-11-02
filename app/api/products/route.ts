import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { productSchema } from '@/lib/validations';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  }
  if (currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Solo un administrador puede agregar productos a la carta.' },
      { status: 403 }
    );
  }

  const parsed = productSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el producto', error);
    return NextResponse.json({ error: 'No fue posible crear el producto.' }, { status: 500 });
  }
}
