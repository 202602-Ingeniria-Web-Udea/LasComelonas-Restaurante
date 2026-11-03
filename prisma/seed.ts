// Datos de ejemplo para probar el sistema. Se ejecuta con: npx prisma db seed
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { calculateOrderTotals } from '../lib/orders';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;

// Fecha de hace cierto número de días y horas, para repartir los movimientos en el tiempo.
function daysAgo(days: number, hours = 0) {
  return new Date(Date.now() - days * DAY_IN_MS - hours * HOUR_IN_MS);
}

// Insumos de la cocina: saldo inicial, consumo de cada uno de los últimos 10 días
// y cada cuántos días llega un pedido del proveedor.
const masters = [
  { name: 'Arroz para sushi (kg)', initial: 40, dailyUse: [5, 6, 4, 7, 5, 8, 6, 5, 7, 4], restockEvery: 4, restock: 25 },
  { name: 'Alga nori (hojas)', initial: 200, dailyUse: [30, 25, 40, 35, 28, 45, 50, 30, 26, 33], restockEvery: 3, restock: 100 },
  { name: 'Salmón fresco (kg)', initial: 12, dailyUse: [2, 3, 2, 3, 2, 4, 3, 2, 3, 2], restockEvery: 2, restock: 5 },
  { name: 'Atún rojo (kg)', initial: 8, dailyUse: [1, 2, 1, 1, 2, 2, 1, 1, 2, 1], restockEvery: 3, restock: 4 },
  { name: 'Fideos de ramen (porciones)', initial: 120, dailyUse: [18, 22, 15, 25, 20, 30, 28, 19, 21, 24], restockEvery: 3, restock: 60 },
  { name: 'Caldo tonkotsu (litros)', initial: 30, dailyUse: [5, 6, 4, 7, 6, 8, 7, 5, 6, 6], restockEvery: 2, restock: 12 },
  { name: 'Huevo marinado ajitama (unidades)', initial: 60, dailyUse: [10, 12, 8, 14, 11, 16, 15, 10, 12, 13], restockEvery: 3, restock: 36 },
  { name: 'Salsa de soya (litros)', initial: 10, dailyUse: [1, 1, 2, 1, 1, 2, 2, 1, 1, 1], restockEvery: 5, restock: 6 },
];

const products = [
  { codigo: 101, name: 'Nigiri de salmón', description: 'Dos bocados de arroz avinagrado cubiertos con salmón fresco.', cantidad: 2, price: 14000 },
  { codigo: 102, name: 'Maki California', description: 'Cangrejo, aguacate y pepino envueltos en alga nori.', cantidad: 8, price: 26000 },
  { codigo: 103, name: 'Uramaki Sakura', description: 'Roll invertido de salmón y queso crema con salsa de anguila.', cantidad: 8, price: 32000 },
  { codigo: 104, name: 'Sashimi de atún', description: 'Cortes finos de atún rojo con wasabi y jengibre encurtido.', cantidad: 5, price: 30000 },
  { codigo: 201, name: 'Ramen tonkotsu', description: 'Caldo de cerdo cocido por 12 horas, chashu, ajitama y cebollín.', cantidad: 1, price: 38000 },
  { codigo: 202, name: 'Ramen shoyu', description: 'Caldo de pollo con salsa de soya, fideos frescos y menma.', cantidad: 1, price: 34000 },
  { codigo: 301, name: 'Gyozas a la plancha', description: 'Empanaditas japonesas de cerdo y repollo con salsa ponzu.', cantidad: 6, price: 18000 },
  { codigo: 401, name: 'Té verde matcha', description: 'Té verde japonés preparado al momento, frío o caliente.', cantidad: 1, price: 9000 },
];

async function main() {
  // Se borra en orden inverso a las relaciones para no romper las llaves foráneas.
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.master.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: 'Light',
      lastName: 'Yagami',
      email: 'admin@sakuraya.com',
      password: await bcrypt.hash('Sakura2026*', 10),
      role: 'ADMIN',
      profile: {
        create: {
          image: '',
          address: '',
          phone: '',
        },
      },
    },
  });
  const staffUser = await prisma.user.create({
    data: {
      name: 'Misa',
      lastName: 'Amane',
      email: 'usuario@sakuraya.com',
      password: await bcrypt.hash('Ramen2026*', 10),
      role: 'USER',
      profile: {
        create: {
          image: '',
          address: '',
          phone: '',
        },
      },
    },
  });

  // Maestros con movimientos de los últimos 10 días.
  for (const master of masters) {
    const movements: { type: 'ENTRY' | 'EXIT'; quantity: number; date: Date; userId: string }[] = [
      { type: 'ENTRY', quantity: master.initial, date: daysAgo(10, 3), userId: admin.id },
    ];
    let balance = master.initial;

    master.dailyUse.forEach((use, index) => {
      const day = 9 - index;
      if (index > 0 && index % master.restockEvery === 0) {
        movements.push({ type: 'ENTRY', quantity: master.restock, date: daysAgo(day, 6), userId: admin.id });
        balance += master.restock;
      }
      const exit = Math.min(use, balance);
      if (exit > 0) {
        movements.push({ type: 'EXIT', quantity: exit, date: daysAgo(day, 1), userId: staffUser.id });
        balance -= exit;
      }
    });

    await prisma.master.create({
      data: {
        name: master.name,
        balance,
        createdById: admin.id,
        createdAt: daysAgo(10, 3),
        transactions: { create: movements },
      },
    });
  }

  const createdProducts = await Promise.all(
    products.map((product) => prisma.product.create({ data: product }))
  );
  const productByCode = new Map(createdProducts.map((product) => [product.codigo, product]));

  const valentina = await prisma.customer.create({
    data: {
      name: 'Valentina Restrepo',
      email: 'valentina.restrepo@correo.com',
      phone: '300 555 0101',
      address: 'Cra. 43A #7-50, El Poblado, Medellín',
    },
  });
  const santiago = await prisma.customer.create({
    data: {
      name: 'Santiago Gómez',
      email: 'santiago.gomez@correo.com',
      phone: '301 555 0202',
      address: 'Cl. 10 #32-15, Laureles, Medellín',
    },
  });

  // Arma las líneas de un pedido a partir de [código, cantidad].
  function buildLines(items: [number, number][]) {
    return items.map(([codigo, quantity]) => {
      const product = productByCode.get(codigo)!;
      return { productId: product.id, price: product.price, quantity };
    });
  }

  // Pedido 1: ya entregado y pagado con tarjeta.
  const deliveredLines = buildLines([
    [201, 1],
    [103, 1],
    [401, 2],
  ]);
  const deliveredTotals = calculateOrderTotals(deliveredLines);
  await prisma.order.create({
    data: {
      customerId: valentina.id,
      orderDate: daysAgo(2, 4),
      status: 'DELIVERED',
      ...deliveredTotals,
      orderItems: { create: deliveredLines },
      payment: {
        create: {
          amount: deliveredTotals.totalAmount,
          method: 'CREDIT_CARD',
          status: 'COMPLETED',
          paymentDate: daysAgo(2, 4),
        },
      },
    },
  });

  // Pedido 2: recién tomado, pendiente de pago.
  const pendingLines = buildLines([
    [102, 2],
    [301, 1],
  ]);
  await prisma.order.create({
    data: {
      customerId: santiago.id,
      status: 'PENDING',
      ...calculateOrderTotals(pendingLines),
      orderItems: { create: pendingLines },
    },
  });

  console.log('Seed completado: 2 usuarios, 8 maestros, 8 productos, 2 clientes y 2 pedidos.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
