import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Si el cuerpo no es un JSON válido se trata como vacío y responde el error de validación.
  const data = await request.json().catch(() => ({}));
  if (!data.email || !data.password) {
    return NextResponse.json({ error: 'Ingresa tu correo y tu contraseña.' }, { status: 400 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        password: true,
        enabled: true,
        deleted: true,
      },
    });
    // bcrypt.compare calcula el hash de la contraseña escrita y lo compara con el guardado.
    const isValidPassword = user ? await bcrypt.compare(data.password, user.password) : false;

    // Se responde el mismo mensaje si el correo no existe o si la contraseña falla,
    // para no revelar qué correos están registrados.
    if (!user || !isValidPassword) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    }
    if (!user.enabled || user.deleted) {
      return NextResponse.json({ error: 'Tu usuario está deshabilitado.' }, { status: 403 });
    }

    await createSession(user.id);
    return NextResponse.json({ message: 'Sesión iniciada' }, { status: 200 });
  } catch (error) {
    console.error('Error al iniciar sesión', error);
    return NextResponse.json({ error: 'No fue posible iniciar sesión.' }, { status: 500 });
  }
}
