'use client';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { DailyBalance } from '@/lib/inventory';

// El color sakura y el relleno en degradado mantienen la gráfica ligera sobre el papel.
const chartConfig = {
  balance: {
    label: 'Saldo',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function BalanceChart({ data }: { data: DailyBalance[] }) {
  if (!data.length) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        La gráfica aparecerá cuando el maestro tenga movimientos.
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-64 w-full'>
      <AreaChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
      <defs>
        <linearGradient id='balanceFill' x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stopColor='var(--color-balance)' stopOpacity={0.28} />
          <stop offset='95%' stopColor='var(--color-balance)' stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} stroke='var(--border)' strokeOpacity={0.55} />
        <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='line' />} />
        <Area
          dataKey='balance'
          type='linear'
          fill='url(#balanceFill)'
          stroke='var(--color-balance)'
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
