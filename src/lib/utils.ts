// Utilidades de formato compartidas por la interfaz.

const TIME_ZONE = "America/Bogota";

/** Fecha y hora legibles en español (zona horaria de Colombia). */
export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

/** Solo la fecha, p. ej. "1 nov 2026". */
export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

/** Clave de día (AAAA-MM-DD) en hora de Colombia, usada para agrupar movimientos. */
export function dayKey(value: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(
    new Date(value)
  );
}

/** Iniciales del nombre para el avatar cuando el usuario no tiene foto. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
