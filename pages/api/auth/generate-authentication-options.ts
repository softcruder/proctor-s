import { NextApiRequest, NextApiResponse } from 'next';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { supabase } from '@/lib/Supabase/supabaseClient';
import { rpName, rpID } from '@/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { test_id, username } = req.query;

  let errors = {};

  if (typeof test_id !== 'string') {
    errors = { ...errors, test_id: "Invalid Test ID" };
    return res.status(400).json({ error: errors });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('test_id', test_id)
    .single();

  if (error || !user) {
    errors = { ...errors };
    return res.status(400).json({ error: errors, message: "User not found!" });
  }

  if(user?.username !== username) {
    errors = { ...errors, username: "Invalid username" };
    return res.status(400).json({ error: errors });
  }

  const options = generateAuthenticationOptions({
    rpID,
    rpName,
    userVerification: 'preferred',
    allowCredentials: [
      {
        id: user.id,
        type: 'public-key',
      },
    ],
    challenge,
  });

  res.status(200).json(options);
}
