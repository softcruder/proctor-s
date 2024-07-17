import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionPayload } from '@/app/auth/auth';
import { supabase } from '@/lib/Supabase/supabaseClient';

const secretKey = process.env.SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5hr')
    .sign(key);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.log('Failed to verify session, from auth');
    let errObj = {};
    if (error) {
        errObj = {error}
    }
    return { ...errObj, message: 'Failed to verify session'};
  }
}

export async function createSession(id: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 1. Create a session in the database
  const { data, error} = await supabase
    .from('sessions')
    .insert([{
      user_id: id,
      expires: expiresAt,
    }])

  const sessionId = data && data[0] ? data[0]?.id : null;

  // 2. Encrypt the session ID
  const session = await encrypt({ user_id: id, expires: expiresAt });

  // 3. Store the session in cookies for optimistic auth checks
  cookies().set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/dashboard',
  });
}