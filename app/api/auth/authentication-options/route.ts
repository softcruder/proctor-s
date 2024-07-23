import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { rpName, rpID, isDev, APPNAME } from '@/config';
import { getPasskey, getUser } from '@/utils/supabase';
import { ACT_REGISTER } from '@/constants/server';
import { NextResponse, NextRequest } from 'next/server';
import { arrayToCommaSeparatedStringWithAnd, findUnexpectedKeys, generateChallenge } from '@/helpers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { student_id, email, credentials } = body;
  let errors = {};

  // Check if the body contains only the required keys
  const bodyKeys = Object.keys(body);
  if (bodyKeys.length !== 3 || !bodyKeys.includes('student_id') || !bodyKeys.includes('email')) {
    const unexpectedkeys = findUnexpectedKeys(credentials, { student_id, email });
    const formatted = arrayToCommaSeparatedStringWithAnd(unexpectedkeys);
    return NextResponse.json(
      { error: "Invalid request.", message: `${formatted} should not exist` },
      { status: 400 }
    );
  }

  // Validate the types of student_id and email
  if (typeof student_id !== 'string' || typeof email !== 'string') {
    return NextResponse.json(
      { error: "Invalid request. ", message: "Malformed request type" },
      { status: 400 }
    );
  }
  console.log(student_id);

  // Get user from the database
  const { data: user, error } = await getUser({ student_id, email });

  if (error || !user) {
    return NextResponse.json(
      { error: "User not found!" },
      { status: 400 }
    );
  }

  // Compare the provided email with the one in the database
  if (user.email !== email) {
    return NextResponse.json(
      { error: "Invalid credentials. Email does not match." },
      { status: 400 }
    );
  }

  const { data: passkeys, error: passkeyError } = await getPasskey({ internal_user_id: user?.id })

  if (passkeyError || !passkeys) {
    errors = { ...errors };
    return NextResponse.json({ error: errors, message: ACT_REGISTER }, { status: 400 });
  }

  // If we've made it this far, the credentials are valid
  // Proceed with the authentication process (e.g., generate WebAuthn options)

  const challenge = user?.challenge || generateChallenge(32);

  const options = await generateAuthenticationOptions({
    rpID: isDev ? 'localhost' : rpID || 'proctorxpert.vercel.app',
    // userVerification: 'preferred',
    allowCredentials: passkeys?.map((passkey: { cred_id: any; transports: any; additional_details: any; }) => ({
      id: Buffer.from(passkey.cred_id || passkey.additional_details?.id, 'base64'),
      type: passkey.additional_details?.type || 'public-key',
      transports: passkey.transports?.split(', ') || [passkey.transports] || [],
    })),
    // challenge,
  });
  // const lastPasskey = passkeys[0];
  // const additional_details = { publicKey: lastPasskey.additional_details?.response?.publicKey, type: lastPasskey?.additional_details?.type };

  return NextResponse.json({ authenticationOptions: options, id: user?.id, challenge: options.challenge }, { status: 200 });
}
