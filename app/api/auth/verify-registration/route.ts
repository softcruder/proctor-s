import { NextApiRequest, NextApiResponse } from 'next';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { rpID, isDev } from '@/config';
import { supabase } from "@/lib/Supabase/supabaseClient";
import { upsertSession } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { attestation, userId } = req.body;

  try {
    // Fetch the challenge from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('challenge')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error(`Error fetching user challenge: ${userError?.message || 'No user data found'}`);
    }

    const expectedChallenge = userData.challenge;

    const origin = isDev ? 'http://localhost:3000' : 'https://proctoxpert.vercel.app';

    const verification = await verifyRegistrationResponse({
      response: attestation,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: isDev ? 'localhost' : rpID,
    });

    if (!verification.verified) {
      throw new Error('Verification failed');
    }

    // Save the credential in the database
    const { error: credentialError } = await supabase
      .from('passkeys')
      .insert({
        internal_user_id: userId,
        cred_id: attestation.id,
        public_key: attestation.response.publicKey,
        counter: attestation.response.authenticatorData.counter,
      })
      .single();

    if (credentialError) {
      throw new Error(`Error saving credential: ${credentialError.message}`);
    }

    // Create a session
    const { data: sessionData, error: sessionError } = await upsertSession(userId);

    if (sessionError || !sessionData) {
      throw new Error(`Error creating session: ${sessionError?.message || 'No session data found'}`);
    }

    // Clear the challenge from the user record
    const { error: clearChallengeError } = await supabase
      .from('users')
      .update({ challenge: null })
      .eq('id', userId);

    if (clearChallengeError) {
      throw new Error(`Error clearing challenge: ${clearChallengeError.message}`);
    }

    const sessionToken = sessionData.token;

    res.status(200).json({ verified: true, sessionToken });
  } catch (error: any) {
    console.error('Verification error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Verification failed' });
  }
}