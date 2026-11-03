# Sakura-ya

Sistema de gestión para un restaurante de comida japonesa donde el personal del restaurante puede gestionar los pedidos, junto con el inventario de alimentos.

## Aplicación en línea

Link Vercel: https://lascomelonas-restaurante.vercel.app/

## Integrantes

- María de los Ángeles Agudelo Agudelo
- Luisa María Soto Arias

## Funcionalidades

- **Inicio de sesión:** acceso con correo y contraseña.
- **Pedidos:** registro del pedido de un cliente con sus productos, registro del pago y seguimiento del estado hasta la entrega (pendiente de pago, pagado, listo, en camino y entregado). También es posible cancelarlos.
- **Clientes:** registro y consulta de los clientes.
- **Carta:** catálogo de los platos del restaurante, con su precio.
- **Maestros:** registro de los elementos que se controlan en el inventario.
- **Transacciones:** entradas y salidas de inventario, con una gráfica del saldo diario.
- **Usuarios:** administración de las cuentas del personal.

## Tecnologías

- Next.js 16 y React 19, con TypeScript
- Tailwind CSS 4
- Prisma 7 como capa de acceso a datos
- PostgreSQL alojado en Supabase

## Cómo ejecutarlo en local

1. Clonar el repositorio e instalar las dependencias:

   ```
   git clone https://github.com/MariAgudelo2/LasComelonas-Restaurante.git
   cd LasComelonas-Restaurante
   npm install
   ```

2. Crear un archivo `.env` en la raíz del proyecto a partir de `.env.example` y completar dos variables:

   - `DATABASE_URL`: la cadena de conexión de la base de datos en Supabase (Project Settings > Database > Connection string).
   - `SESSION_SECRET`: un texto secreto para firmar las sesiones, que se puede generar con `openssl rand -base64 32`.

3. Iniciar el proyecto:

   ```
   npm run dev
   ```

4. Abrir `http://localhost:3000` en el navegador.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@sakuraya.com | Sakura2026* |
| Usuario | usuario@sakuraya.com | Ramen2026* |

## Estructura del proyecto

- `app/`: páginas y rutas de la API.
- `components/`: componentes de cada módulo y componentes de interfaz compartidos.
- `lib/`: lógica compartida (sesión, pedidos, inventario, validaciones).
- `prisma/`: esquema de la base de datos, migraciones y datos de ejemplo.
