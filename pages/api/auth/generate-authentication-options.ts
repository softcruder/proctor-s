import { NextApiRequest, NextApiResponse } from 'next';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { rpName, rpID, isDev } from '@/config';
import { getPasskey, getUser } from '@/utils/supabase';
import { ACT_REGISTER } from '@/constants/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  let errors = {};

  if (typeof username !== 'string') {
    errors = { ...errors, username: "Username is required" };
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
  const { data: passkeys, error: passkeyError } = await getPasskey({ internal_user_id: user?.id })

  if (passkeyError || !passkeys) {
    errors = { ...errors };
    return res.status(400).json({ error: errors, message: ACT_REGISTER });
  }

  const options = await generateAuthenticationOptions({
    rpID: rpID || isDev ? 'localhost' : 'scrud-proctor-s',
    // userVerification: 'preferred',
    allowCredentials: passkeys?.map((passkey: { cred_id: any; transports: any; }) => ({
      id: passkey.cred_id,
      transports: [passkey.transports]
    }))
    // ],
    // challenge: user?.challenge,
  });

  res.status(200).json(options);
}
