import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { editUserSchema, userSchema } from '@/lib/validations';

const updateUserSchema = editUserSchema.extend({
  userId: z.string().min(1, 'Falta el usuario a editar.'),
});

async function requireAdmin() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { currentUser: null, errorResponse: NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 }) };
  }
  if (currentUser.role !== 'ADMIN') {
    return {
      currentUser: null,
      errorResponse: NextResponse.json(
        { error: 'Solo un administrador puede gestionar usuarios.' },
        { status: 403 }
      ),
    };
  }
  return { currentUser, errorResponse: null };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const parsed = userSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, lastName, email, password, role, image } = parsed.data;

  try {
    const createdUser = await prisma.user.create({
      data: {
        name,
        lastName: lastName || null,
        email,
        role,
        password: await bcrypt.hash(password, 10),
        profile: image ? { create: { image, address: '', phone: '' } } : undefined,
      },
      select: { id: true, email: true, role: true },
    });
    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un usuario con ese correo.' }, { status: 409 });
    }
    console.error('Error al crear el usuario', error);
    return NextResponse.json({ error: 'No fue posible crear el usuario.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const { currentUser, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const parsed = updateUserSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { userId, name, lastName, image, role } = parsed.data;

  if (userId === currentUser.id && role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'No puedes quitarte el rol de administrador a ti mismo.' },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        lastName: lastName || null,
        role,
        // upsert: si el usuario ya tiene Profile se actualiza la foto; si no, se crea.
        // Una URL vacía deja el perfil sin foto y el sidebar muestra las iniciales.
        profile: {
          upsert: {
            create: { image, address: '', phone: '' },
            update: { image },
          },
        },
      },
      select: { id: true, email: true, role: true },
    });
    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'El usuario no existe.' }, { status: 404 });
    }
    console.error('Error al editar el usuario', error);
    return NextResponse.json({ error: 'No fue posible editar el usuario.' }, { status: 500 });
  }
}