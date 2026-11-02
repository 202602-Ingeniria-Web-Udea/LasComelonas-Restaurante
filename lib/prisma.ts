import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

// En clase el esquema "dev" estaba fijo aquí, pero el CLI de Prisma crea las tablas en el
// esquema que indique el parámetro ?schema= del DATABASE_URL (o en "public" si no viene).
// Leemos ese mismo parámetro para que la app consulte siempre el esquema donde se migró.
const schema = connectionString.match(/[?&]schema=([^&]+)/)?.[1] ?? 'public';

const adapter = new PrismaPg(
  { connectionString },
  {
    schema,
  }
);
const prisma = new PrismaClient({ adapter });

export { prisma };
