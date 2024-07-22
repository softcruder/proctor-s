import { cookies } from 'next/headers';
import { upsertSession, findSessionByIdAndDelete, findSessionById } from '@/utils/supabase';

export async function getSession() {
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) return null;

  const { data: session } = await findSessionById(sessionId);
  return session;
}

export async function setSession(userId: string) {
  const { data: session, error } = await upsertSession(userId);
  if (error) {
    throw new Error ('Unable to create session');
  }
  cookies().set('sessionId', session.id, { httpOnly: true, secure: true });
  return session;
}

export async function clearSession(id: any) {
  const sessionId = cookies().get('sessionId')?.value;
  if (sessionId) {
    await findSessionByIdAndDelete(sessionId);
    cookies().delete('sessionId');
  }
}