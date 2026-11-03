import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { getCurrentUser } from '@/lib/auth';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // El proxy ya revisó la cookie; aquí se confirma que el usuario existe y sigue habilitado.
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const sidebarUser = {
    name: [currentUser.name, currentUser.lastName].filter(Boolean).join(' '),
    email: currentUser.email,
    role: currentUser.role,
    image: currentUser.profile?.image || null,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      {/* min-w-0 evita que una tabla ancha estire la página: la tabla se desplaza por dentro. */}
      <SidebarInset className='min-w-0'>
        <header className='relative flex h-16 shrink-0 items-center gap-2 overflow-hidden border-b border-border/70 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
            <span className='text-sm text-muted-foreground'>Sakura-ya · Panel del restaurante</span>
          </div>
        </header>
        <div className='flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0'>
          {children}
          <Toaster richColors position='top-right' />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
