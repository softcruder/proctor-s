// pages/api/auth/verify-authentication.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { supabase } from '@/lib/Supabase/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { credential, userID } = req.body;

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

  try {
    const verification = await verifyAuthenticationResponse({
        response: credential, // Assuming 'response' is the correct field to use from 'credential'
        expectedChallenge: user.currentChallenge,
        expectedOrigin: 'https://your-domain.com', // Replace with your domain
        expectedRPID: 'your-domain.com',
        authenticator: {
            credentialID: '',
            credentialPublicKey: undefined,
            counter: 0,
            transports: undefined
        }
    });

    if (verification.verified) {
      // Handle successful authentication (e.g., set session, return success response)
      res.status(200).json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
