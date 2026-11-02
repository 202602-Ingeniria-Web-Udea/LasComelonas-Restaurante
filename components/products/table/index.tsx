import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';

type ProductRow = {
  id: string;
  codigo: number;
  name: string;
  description: string;
  cantidad: number;
  price: number;
};

export function ProductsTable({ products }: { products: ProductRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className='text-right'>Piezas</TableHead>
          <TableHead className='text-right'>Precio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length ? (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className='font-mono text-xs'>{product.codigo}</TableCell>
              <TableCell className='font-medium'>{product.name}</TableCell>
              {/* La descripción puede ser larga: se permite partirla en varias líneas. */}
              <TableCell className='min-w-64 whitespace-normal text-muted-foreground'>
                {product.description}
              </TableCell>
              <TableCell className='text-right tabular-nums'>{product.cantidad}</TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatCurrency(product.price)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
              La carta está vacía.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
