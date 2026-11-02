'use client';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Dropdown para elegir el Maestro. Al cambiarlo se actualiza la URL y la página de servidor
// vuelve a cargar los movimientos del Maestro elegido.
export function MasterSelect({
  masters,
  selectedMasterId,
}: {
  masters: { id: string; name: string }[];
  selectedMasterId: string;
}) {
  const router = useRouter();
  // "items" le dice al Select qué texto mostrar para cada valor (el nombre en lugar del id).
  const items = masters.map((master) => ({ label: master.name, value: master.id }));

  return (
    <Select
      items={items}
      value={selectedMasterId}
      onValueChange={(masterId) => {
        if (masterId) router.push(`/transactions?masterId=${masterId}`);
      }}
    >
      <SelectTrigger className='w-full sm:w-64' aria-label='Maestro'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Maestros</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
