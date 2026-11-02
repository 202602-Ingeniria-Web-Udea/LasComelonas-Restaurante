'use client';

import * as React from 'react';
import Link from 'next/link';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  IconArrowsExchange,
  IconBowlChopsticks,
  IconBox,
  IconReceipt,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';

type SidebarUser = {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  image: string | null;
};

// Enlaces del menú agrupados por área del restaurante.
const restaurantLinks = [
  { title: 'Pedidos', url: '/orders', icon: <IconReceipt /> },
  { title: 'Clientes', url: '/customers', icon: <IconUsersGroup /> },
  { title: 'Carta', url: '/products', icon: <IconBowlChopsticks /> },
];

const inventoryLinks = [
  { title: 'Transacciones', url: '/transactions', icon: <IconArrowsExchange /> },
  { title: 'Maestros', url: '/masters', icon: <IconBox /> },
];

const adminLinks = [{ title: 'Usuarios', url: '/users', icon: <IconUsers /> }];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: SidebarUser }) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        {/* Marca del restaurante en lugar del TeamSwitcher de la plantilla. */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' render={<Link href='/orders' />}>
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground'>
                桜
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>Sakura-ya</span>
                <span className='truncate text-xs opacity-70'>Sushi y ramen</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label='Restaurante' items={restaurantLinks} />
        <NavMain label='Inventario' items={inventoryLinks} />
        {/* El enlace de Usuarios solo se muestra al ADMIN. La página también lo valida en el servidor. */}
        {user.role === 'ADMIN' && <NavMain label='Administración' items={adminLinks} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
