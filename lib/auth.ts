import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Devuelve el usuario con sesión iniciada (o null). Se separa de lib/session.ts para que el
// proxy, que solo revisa la cookie, no tenga que cargar Prisma.
// cache() evita repetir la consulta cuando el layout y la página la piden en la misma petición.
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      role: true,
      enabled: true,
      deleted: true,
      profile: { select: { image: true } },
    },
  });

  if (!user || !user.enabled || user.deleted) return null;
  return user;
});
