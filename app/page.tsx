import Link from 'next/link';
import { IconBowlChopsticks, IconBox, IconReceipt } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    title: 'Pedidos',
    description: 'Registra pedidos, cobra y sigue cada entrega.',
    icon: <IconReceipt className='size-5 text-primary' />,
  },
  {
    title: 'Inventario',
    description: 'Controla entradas y salidas de los insumos de cocina.',
    icon: <IconBox className='size-5 text-primary' />,
  },
  {
    title: 'Carta',
    description: 'Sushi, ramen y bebidas con sus precios.',
    icon: <IconBowlChopsticks className='size-5 text-primary' />,
  },
];

export default function Home() {
  return (
    <main className='flex flex-1 flex-col items-center justify-center gap-10 px-4 py-16 text-center'>
      <div className='flex flex-col items-center gap-4'>
        <div className='flex size-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground shadow-md'>
          桜屋
        </div>
        <h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>Sakura-ya</h1>
        <p className='max-w-md text-balance text-muted-foreground'>
          Sushi y ramen artesanal. Sistema de gestión de pedidos, pagos, entregas e inventario
          para el personal del restaurante.
        </p>
        <Button size='lg' className='mt-2 px-6' nativeButton={false} render={<Link href='/login' />}>
          Iniciar sesión
        </Button>
      </div>
      <div className='grid w-full max-w-3xl gap-4 sm:grid-cols-3'>
        {features.map((feature) => (
          <div key={feature.title} className='flex flex-col items-center gap-2 rounded-xl border bg-card p-5'>
            {feature.icon}
            <h2 className='font-semibold'>{feature.title}</h2>
            <p className='text-sm text-muted-foreground'>{feature.description}</p>
          </div>
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>© 2026 Sakura-ya. Todos los derechos reservados.</p>
    </main>
  );
}
