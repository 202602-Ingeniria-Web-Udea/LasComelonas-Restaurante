import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const schema = connectionString.match(/[?&]schema=([^&]+)/)?.[1] ?? 'public';

function createPrismaClient() {
  const adapter = new PrismaPg(
    {
      connectionString,
      // Supabase limita cuántas conexiones puede tener abiertas el pooler. Cada instancia de la
      // app usa máximo 5 y cierra las que lleven 10 segundos sin usarse.
      max: 5,
      idleTimeoutMillis: 10_000,
    },
    {
      schema,
    }
  );
  return new PrismaClient({ adapter });
}

// Cada vez que se guarda un archivo Next vuelve a cargar este módulo. Si se
// creara un PrismaClient nuevo en cada recarga, las conexiones viejas quedarían abiertas
// hasta agotar el límite de Supabase (ya nos sucedió). Por eso el cliente se guarda en globalThis y se reutiliza.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };