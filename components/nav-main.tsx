'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

// Versión simplificada del NavMain de clase: enlaces directos, sin submenús desplegables.
export function NavMain({
  label,
  items,
}: {
  label: string;
  items: {
    title: string;
    url: string;
    icon: React.ReactNode;
  }[];
}) {
  // La ruta actual se usa para resaltar el enlace de la página en la que estamos.
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={pathname.startsWith(item.url)}
              className={`rounded-none border-l-2 ${
                pathname.startsWith(item.url)
                  ? 'border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'border-transparent'
              }`}
              render={<Link href={item.url} />}
            >
              {item.icon}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
