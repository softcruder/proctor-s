import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { rpID, isDev } from '@/config';
import { supabase } from "@/lib/Supabase/supabaseClient";
import { upsertSession } from '@/utils/supabase';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  // if (req.method !== 'POST') {
  //   return res.status(405).json({ error: 'Method not allowed' });
  // }

  const { attestation, userId } = await req.json();

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

    const origin = isDev ? ["localhost", "http://localhost:3000", "http://localhost:3001",] : ["localhost", "http://localhost:3000", "http://localhost:3001", 'https://proctorxpert.vercel.app'];

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
        cred_public_key: attestation.response.publicKey,
        counter: attestation.response.authenticatorData.counter || 1,
        backup_eligible: true,
        transports: attestation.response.transports?.join(','),
        additional_details: {...attestation}
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

    const response = NextResponse.json({ verified: true, sessionToken }, { status: 200 });
    response.cookies.set("pr-stoken", sessionToken, {
      httpOnly: true,
      maxAge: sessionData.expires || 60 * 60 * 12, // 12 hours
      secure: process.env.NEXT_PUBLIC_ENVIRONMENT === "production",
    });
    response.cookies.set("session_id", sessionData.id, {
      httpOnly: true,
      maxAge: sessionData.expires || 60 * 60 * 12, // 12 hours
      secure: process.env.NEXT_PUBLIC_ENVIRONMENT === "production",
    });
    return response;
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Verification failed' }, { status: 400 });
  }
}