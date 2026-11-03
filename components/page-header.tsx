// Encabezado común de las páginas: título, descripción y, a la derecha, el botón de acción.
// En el celular el botón baja debajo del título.
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>{title}</h1>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      {children && <div className='flex flex-wrap gap-2'>{children}</div>}
    </div>
  );
}
