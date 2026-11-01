// Datos de marca del restaurante. Cambiar el nombre aquí lo actualiza en toda la app.
export const BRAND = {
  name: "Sakura-ya",
  tagline: "Sushi, ramen y cocina japonesa",
  kanji: "桜屋",
} as const;

// Categorías disponibles para los insumos (Maestros) del restaurante.
export const CATEGORIES = [
  "Pescados y mariscos",
  "Arroz y fideos",
  "Caldos y salsas",
  "Vegetales",
  "Carnes y huevos",
  "Algas y encurtidos",
  "Bebidas",
  "Otros",
] as const;

// Unidades de medida permitidas para los insumos.
export const UNITS = ["kg", "L", "unidades", "paquetes"] as const;
