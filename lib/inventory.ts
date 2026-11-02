import { formatDayKey, toDayKey } from '@/lib/format';

type Movement = {
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  date: Date;
};

export type DailyBalance = {
  day: string;
  label: string;
  balance: number;
};

// Día siguiente a una clave AAAA-MM-DD.
function nextDayKey(dayKey: string) {
  const date = new Date(`${dayKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// Calcula el saldo al cierre de cada día, desde el primer movimiento hasta hoy.
// Como el saldo inicial de cada Maestro se guarda como un movimiento de entrada,
// basta con ir sumando entradas y restando salidas día por día.
// Los días sin movimientos repiten el saldo anterior para que la línea sea continua.
export function buildDailyBalances(movements: Movement[]): DailyBalance[] {
  if (!movements.length) return [];

  const changeByDay = new Map<string, number>();
  for (const movement of movements) {
    const day = toDayKey(movement.date);
    const change = movement.type === 'ENTRY' ? movement.quantity : -movement.quantity;
    changeByDay.set(day, (changeByDay.get(day) ?? 0) + change);
  }

  const days = [...changeByDay.keys()].sort();
  const today = toDayKey(new Date());
  const lastDay = days[days.length - 1] > today ? days[days.length - 1] : today;

  const dailyBalances: DailyBalance[] = [];
  let balance = 0;
  // Las claves AAAA-MM-DD se pueden comparar como texto porque siguen el orden de las fechas.
  for (let day = days[0]; day <= lastDay; day = nextDayKey(day)) {
    balance += changeByDay.get(day) ?? 0;
    dailyBalances.push({ day, label: formatDayKey(day), balance });
  }
  return dailyBalances;
}
