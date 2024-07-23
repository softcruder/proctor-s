import { cookies } from 'next/headers';
import { upsertSession, findSessionByIdAndDelete, findSessionById } from '@/utils/supabase';
import { isDev } from '@/config';

export async function getSession() {
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) return null;

  const { data: session } = await findSessionById(sessionId);
  return session;
}

export async function setSession(userId: string) {
  const { data: session, error } = await upsertSession(userId);
  console.log(session)
  if (error) {
    throw new Error ('Unable to create session');
  }
  cookies().set('sessionId', session?.id, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, secure: !isDev });
  return session;
}

export async function clearSession(id: any) {
  const sessionId = cookies().get('sessionId')?.value;
  if (sessionId) {
    await findSessionByIdAndDelete(sessionId);
    cookies().delete('sessionId');
  }
}