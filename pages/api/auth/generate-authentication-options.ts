// pages/api/auth/generate-authentication-options.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { supabase } from '@/lib/Supabase/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userID } = req.query;

  if (typeof userID !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userID)
    .single();

  if (error || !user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const options = generateAuthenticationOptions({
    rpID: 'your-domain.com', // Replace with your domain
    userVerification: 'preferred',
    allowCredentials: [
      {
        id: user.webauthnID,
        type: 'public-key',
      },
    ],
  });

  res.status(200).json(options);
}
