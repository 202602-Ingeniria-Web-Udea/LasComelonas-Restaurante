import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-4 bg-muted p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-4xl'>
        <LoginForm />
      </div>
      <Link href='/' className='text-sm text-muted-foreground underline-offset-4 hover:underline'>
         Volver al inicio
      </Link>
    </div>
  );
}
