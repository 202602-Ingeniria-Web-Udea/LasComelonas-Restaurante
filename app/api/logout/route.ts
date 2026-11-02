import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST(): Promise<NextResponse> {
  await deleteSession();
  return NextResponse.json({ message: 'Sesión cerrada' }, { status: 200 });
}
