import { NextApiRequest, NextApiResponse } from 'next';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { rpName, rpID, isDev } from '@/config';
import { getUser } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, id = '' } = req.query;

  let errors = {};

  if (typeof username !== 'string') {
    errors = { ...errors, test_id: "Invalid Test ID" };
    return res.status(400).json({ error: errors });
  }

  const { data: user, error } = await getUser({ username });

  if (error || !user) {
    errors = { ...errors };
    return res.status(400).json({ error: errors, message: "User not found!" });
  }

  if(user?.username !== username) {
    errors = { ...errors, username: "Invalid username" };
    return res.status(400).json({ error: errors });
  }

  const options = generateAuthenticationOptions({
    rpID: rpID || isDev ? 'localhost' : 'scrud-proctor-s',
    userVerification: 'preferred',
    allowCredentials: [
      {
        id: id?.toString(),
        transports: user?.auth_options?.response?.transports,
      },
    ],
    challenge: user?.challenge,
  });

  res.status(200).json(options);
}
