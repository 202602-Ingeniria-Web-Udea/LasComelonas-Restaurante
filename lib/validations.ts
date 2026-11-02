import * as z from 'zod';

// Esquemas de zod compartidos: los formularios los usan con zodResolver y las API routes
// los vuelven a aplicar, porque el servidor nunca debe confiar en lo que envía el navegador.

export const masterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(60, 'El nombre debe tener máximo 60 caracteres.'),
  initialBalance: z
    .number({ error: 'Ingresa un saldo inicial válido.' })
    .int('El saldo debe ser un número entero.')
    .min(0, 'El saldo inicial no puede ser negativo.'),
});

export const transactionSchema = z.object({
  type: z.enum(['ENTRY', 'EXIT'], { error: 'Selecciona el tipo de movimiento.' }),
  quantity: z
    .number({ error: 'Ingresa una cantidad válida.' })
    .int('La cantidad debe ser un número entero.')
    .positive('La cantidad debe ser mayor que 0.'),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(60, 'El nombre debe tener máximo 60 caracteres.'),
  description: z
    .string()
    .trim()
    .min(5, 'La descripción debe tener al menos 5 caracteres.')
    .max(200, 'La descripción debe tener máximo 200 caracteres.'),
  price: z
    .number({ error: 'Ingresa un precio válido.' })
    .int('El precio debe ser un valor entero en pesos.')
    .positive('El precio debe ser mayor que 0.'),
  codigo: z
    .number({ error: 'Ingresa un código válido.' })
    .int('El código debe ser un número entero.')
    .positive('El código debe ser mayor que 0.'),
  cantidad: z
    .number({ error: 'Ingresa la cantidad de piezas.' })
    .int('Las piezas deben ser un número entero.')
    .positive('Debe haber al menos 1 pieza por porción.'),
});

export const customerSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  email: z.email('Ingresa un correo válido.'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{7,20}$/, 'Ingresa un teléfono válido (solo números, espacios, + o -).'),
  address: z.string().trim().min(5, 'La dirección debe tener al menos 5 caracteres.'),
});

export const roleSchema = z.enum(['ADMIN', 'USER'], { error: 'Selecciona un rol.' });

export const userSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  lastName: z.string().trim(),
  email: z.email('Ingresa un correo válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  role: roleSchema,
  // La foto es opcional: si se deja vacía, el sidebar muestra las iniciales.
  image: z.union([z.url('Ingresa una URL válida.'), z.literal('')]),
});

export const editUserSchema = z.object({
  role: roleSchema,
});

export const orderSchema = z.object({
  customerId: z.string().min(1, 'Selecciona un cliente.'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Selecciona un producto.'),
        quantity: z
          .number({ error: 'Ingresa una cantidad válida.' })
          .int('La cantidad debe ser un número entero.')
          .min(1, 'Mínimo 1.')
          .max(50, 'Máximo 50.'),
      })
    )
    .min(1, 'Agrega al menos un producto.'),
});

export const paymentSchema = z.object({
  method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL'], {
    error: 'Selecciona un método de pago.',
  }),
});
