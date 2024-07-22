import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { APPNAME, isDev, rpID } from "@/config";
import { getPasskey, getUser, upsertSession } from "@/utils/supabase";
import { base64URLStringToBuffer } from "@simplewebauthn/browser";
import { hexStringToBase64URL, hexStringToUint8Array, uint8ArrayToBase64 } from "@/helpers";
import { setSession } from "@/lib";
import { supabase } from "@/lib/Supabase/supabaseClient";

interface BodyData {
  auth_options: any; // Adjust the type as per your auth_options structure
  id: string;
  challenge?: string;
  origin?: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json(); // Type assertion for body as BodyData
  const { auth_options, id: user_id, challenge } = body || { challenge: '' };

  if (typeof user_id !== "string") {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const { data: user, error } = await getUser({ user_id });
  const { data: passkey, error: passkeyError } = await getPasskey({
    internal_user_id: user_id,
    single: true,
  });

  if (error || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (passkeyError || !passkey) {
    return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
  }
  // console.log(passkey)
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'http'; // Handle cases with proxy

  const origin: string[] = ["localhost", "http://localhost:3000", `${protocol}://${host}`]; // Define the origin variable as string array

  if (body.origin) {
    origin.push(body.origin); // Push currentOrigin to origin array
  }

  if (!passkey.cred_public_key) {
    throw new Error('Credential public key is undefined');
  }
  // const bytea = passkey.cred_public_key;
  const bytea = base64URLStringToBuffer(passkey.additional_details?.response?.publicKey);
  // const credentialPublicKey = hexStringToBase64URL(bytea?.toString());
  const credentialPublicKey = new Uint8Array(bytea);
  const credIdArrayBuffer = base64URLStringToBuffer(passkey.cred_id);
  const credentialID = new Uint8Array(credIdArrayBuffer);
  const formattedChallenge = uint8ArrayToBase64(challenge);
  // console.log(formattedChallenge, base64URLStringToBuffer(passkey.additional_details?.response.publicKey), passkey.additional_details?.response.publicKey, credentialPublicKey)

  try {
    const verification = await verifyAuthenticationResponse({
      response: auth_options, // Assuming 'response' is the correct field to use from 'credential'
      expectedChallenge: formattedChallenge || user?.challenge || challenge,
      expectedOrigin: origin,
      expectedRPID: (isDev ? "localhost" : rpID || 'proctorxpert.vercel.app'),
      authenticator: {
        credentialPublicKey,
        credentialID,
        counter: passkey?.counter || 0,
        transports: user?.auth_options?.response?.transports,
      },
    });

    const { verified } = verification;

    if (verified) {
      // update count
      const { data } = await supabase.from('passkeys').update({ cred_id: passkey.cred_id, counter: (passkey.counter || 0) + 1 }).single()
      // 4. Create a new session
      const { data: session, error: sessionError } = await upsertSession(user.id);
      if (sessionError) {
        throw new Error('Failed to create session');
      }
    
      // 5. Return success response with user and session data
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        session,
      }, { status: 200 });
      // console.log(session);
      const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "production";
      const ell = await setSession(user.id);

      response.cookies.set("pr-stoken", session.token, {
        httpOnly: true,
        maxAge: session.expires || 60 * 60 * 12, // 12 hours
        secure: isProduction,
        sameSite: 'lax',
      });
      response.cookies.set("session_id", session.id, {
        httpOnly: true,
        maxAge: session.expires || 60 * 60 * 12, // 12 hours
        secure: isProduction,
        sameSite: 'lax',
      });
      return response;
    } else {
      return NextResponse.json({
        data: { ...verification },
        status: verified || false,
        message: "Auth error, please try again!",
      }, { status: 400 });
    }
  } catch (error: any) {
    // console.log(error)
    return NextResponse.json({ errors: {...error || error}, message: 'Internal server error', status: false }, { status: 500 });
  }
};