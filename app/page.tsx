import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main
      className='relative flex min-h-svh flex-1 flex-col overflow-hidden px-5 pb-8 pt-5 sm:px-10 lg:px-16'
      style={{
        backgroundImage:
          'url("https://i.pinimg.com/1200x/8e/4e/cd/8e4ecd17dd9c6f329001773f39e08d74.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div aria-hidden='true' className='absolute inset-0 bg-background/45' />
      <section className='relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-end py-8 sm:py-12'>
        <div className='w-full max-w-2xl border border-border/80 bg-card/95 p-5 shadow-lg shadow-foreground/10 backdrop-blur-sm sm:p-8 lg:p-10'>
          <div className='flex flex-col items-start gap-5'>
            <div className='hanko-seal flex size-[4.5rem] items-center justify-center text-xl font-semibold text-[#9f3f35] sm:size-20 sm:text-2xl'>
              桜屋
            </div>
            <p className='text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground'>Sushi y ramen artesanal</p>
            <h1 className='font-heading text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl'>Sakura-ya</h1>
            <p className='max-w-md text-pretty leading-7 text-muted-foreground'>
              Sistema de gestión de pedidos, pagos, entregas e inventario para el personal del restaurante.
            </p>
            <Button size='lg' className='mt-1 px-7' nativeButton={false} render={<Link href='/login' />}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      </section>
      <footer className='relative z-10 mt-auto flex justify-between border-t border-border/70 pt-4 text-xs text-foreground'>
        <span>© 2026 Sakura-ya. Todos los derechos reservados.</span>
      </footer>
    </main>
  );
}
