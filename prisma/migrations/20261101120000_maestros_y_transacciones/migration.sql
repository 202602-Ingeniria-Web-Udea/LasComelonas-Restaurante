/*
  Migración del proyecto Sakura-ya:
  - Corrige el typo "oderId" -> "orderId" en Payment. Se renombra la columna (y su índice y
    llave foránea) en lugar de borrarla y crearla de nuevo, así no se pierden pagos existentes.
  - Crea los modelos Master (insumos) y Transaction (movimientos de inventario).
*/
-- CreateEnum
CREATE TYPE "Enum_Transaction_Type" AS ENUM ('ENTRY', 'EXIT');

-- RenameColumn
ALTER TABLE "Payment" RENAME COLUMN "oderId" TO "orderId";

-- RenameIndex
ALTER INDEX "Payment_oderId_key" RENAME TO "Payment_orderId_key";

-- RenameForeignKey
ALTER TABLE "Payment" RENAME CONSTRAINT "Payment_oderId_fkey" TO "Payment_orderId_fkey";

-- CreateTable
CREATE TABLE "Master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "Enum_Transaction_Type" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "masterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Master_name_key" ON "Master"("name");

-- AddForeignKey
ALTER TABLE "Master" ADD CONSTRAINT "Master_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
