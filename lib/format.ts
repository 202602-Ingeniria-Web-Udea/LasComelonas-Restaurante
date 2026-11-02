// Funciones de formato compartidas. Se usa Intl (incluido en JavaScript) para no agregar
// librerías de fechas. La zona horaria es fija porque el servidor de Vercel corre en UTC
// y el restaurante está en Colombia.
export const TIME_ZONE = 'America/Bogota';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: TIME_ZONE,
  dateStyle: 'medium',
  timeStyle: 'short',
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: TIME_ZONE,
  dateStyle: 'medium',
});

// "en-CA" escribe las fechas como AAAA-MM-DD, útil para agrupar movimientos por día.
const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatDateTime(date: Date) {
  return dateTimeFormatter.format(date);
}

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

export function toDayKey(date: Date) {
  return dayKeyFormatter.format(date);
}

// Los id son cuid largos; en las tablas mostramos solo los últimos 6 caracteres.
export function shortId(id: string) {
  return id.slice(-6).toUpperCase();
}

// Convierte una clave AAAA-MM-DD en un texto corto para la gráfica, por ejemplo "28 oct".
// Se usa UTC porque la clave ya viene calculada en la zona horaria del restaurante.
const shortDayFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
});

export function formatDayKey(dayKey: string) {
  return shortDayFormatter.format(new Date(`${dayKey}T12:00:00Z`));
}
