'use client';
import { cn } from 'cn';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Evita que el navegador recargue la página al enviar el formulario.
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error ?? 'No fue posible iniciar sesión.');
        return;
      }
      // La cookie de sesión ya quedó guardada; refresh() hace que el servidor la lea.
      router.push('/orders');
      router.refresh();
    } catch {
      setErrorMessage('No fue posible conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8' onSubmit={handleSubmit}>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-2xl font-bold'>Bienvenido de nuevo</h1>
                <p className='text-balance text-muted-foreground'>
                  Inicia sesión con tu cuenta del personal de Sakura-ya
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor='email'>Correo electrónico</FieldLabel>
                <Input
                  id='email'
                  type='email'
                  placeholder='nombre@sakuraya.com'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor='password'>Contraseña</FieldLabel>
                <Input
                  id='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
              {errorMessage && <FieldError>{errorMessage}</FieldError>}
              <Field>
                <Button type='submit' disabled={isLoading}>
                  {isLoading && <Spinner />}
                  {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className='hidden flex-col items-center justify-center gap-3 bg-primary p-8 text-primary-foreground md:flex'>
            <span className='text-7xl font-bold'>桜屋</span>
            <span className='text-xl font-semibold'>Sakura-ya</span>
            <span className='text-sm opacity-80'>Sushi y ramen</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
