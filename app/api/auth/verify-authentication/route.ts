import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isDev, rpID } from "@/config";
import { getPasskey, getUser } from "@/utils/supabase";
import { base64URLStringToBuffer } from "@simplewebauthn/browser";
import { hexStringToBase64URL, uint8ArrayToBase64, uint8ArrayToBase64URL } from "@/helpers";
import { setSession } from "@/lib";
import { supabase } from "@/lib/Supabase/supabaseClient";
import { COSEPublicKey } from "@simplewebauthn/server/helpers";
import * as cbor from "cbor";

interface BodyData {
  auth_options: any; // Adjust the type as per your auth_options structure
  id: string;
  challenge?: string;
  origin?: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json(); // Type assertion for body as BodyData
  const { auth_options, id: user_id, challenge } = body || { challenge: "" };

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
  const host = req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || "http"; // Handle cases with proxy

  const origin: string[] = [
    "localhost",
    "http://localhost:3000",
    `${protocol}://${host}`,
  ]; // Define the origin variable as string array

  if (body.origin) {
    origin.push(body.origin); // Push currentOrigin to origin array
  }

  if (!passkey.cred_public_key) {
    throw new Error("Credential public key is undefined");
  }

  // Assume passkey.cred_public_key is a hex string from PostgreSQL
  const hexString = passkey.cred_public_key;

  // Step 1: Remove the leading '\x' if present, and convert hex to ASCII
  const cleanedHexString = hexString?.toString()?.replace(/\\x/g, "");

  // Step 2: Convert hexadecimal string to ASCII (JSON string)
  let jsonString = "";
  try {
    // console.log(cleanedHexString);
    jsonString = Buffer.from(cleanedHexString || "", "hex").toString("utf8");
  } catch (error) {
    console.error("Error converting hex to ASCII:", error);
  }
  function base64ToUint8Array(base64: any) {
    // Decode the Base64 string to a binary string
    const binaryString = Buffer.from(base64, "base64").toString("binary");

    // Create a Uint8Array from the binary string
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    return uint8Array;
  }

  // Step 3: Parse the Base64 string into a Uint8Array
  // let uint8Key;
  // try {
  //   console.log(jsonString);
  //   uint8Key = base64ToUint8Array(jsonString);
  // } catch (error) {
  //   console.error("Error parsing JSON string:", error);
  // }

  // Step 4: Convert BYTEA to Uint8Array
  // let uint8Key;
  // try {
  //   const publicKeyBuffer = base64ToUint8Array(jsonString) || cbor.encode(jsonString); // Adjust this based on your data structure
  //   uint8Key = publicKeyBuffer;
  // } catch (error) {
  //   console.error("Error converting to Uint8Array:", error);
  // }

  // console.log("Uint8Array:", uint8Key);

  const credIdArrayBuffer = base64URLStringToBuffer(passkey.cred_id);
  const credentialID = new Uint8Array(credIdArrayBuffer);
  const formattedChallenge = uint8ArrayToBase64(challenge);
  const publicKeyBuffer = base64URLStringToBuffer(jsonString);
  const credentialPublicKey = new Uint8Array(publicKeyBuffer);

  const authenticator = {
    credentialPublicKey: credentialPublicKey,
    credentialID,
    counter: passkey?.counter || 0,
    transports: passkey?.additional_details?.response?.transports,
  }
  const stringBack = uint8ArrayToBase64URL(authenticator.credentialPublicKey);
  
  console.log(authenticator, stringBack);
  const { data } = await supabase
        .from("passkeys")
        .update({
          counter: (passkey.counter || 0) + 1,
        })
        .eq("cred_id", passkey.cred_id)
        .select();

  try {
    const verification = await verifyAuthenticationResponse({
      response: auth_options, // Assuming 'auth_options' is the correct field to use from 'credential'
      expectedChallenge: challenge || formattedChallenge || user.challenge,
      expectedOrigin: origin,
      expectedRPID: isDev ? "localhost" : rpID || "proctorxpert.vercel.app",
      authenticator,
    });

    const { verified } = verification;

    if (verified) {
      
      // 4. Create a new session
      // const { data: session, error: sessionError } = await upsertSession(user.id);
      const session = await setSession(user.id);
      if (!session) {
        throw new Error("Failed to create session");
      }

      // 5. Return success response with user and session data
      const response = NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
          session,
        },
        { status: 200 }
      );
      // console.log(session);
      const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "production";

      response.cookies.set("pr-stoken", session.token, {
        httpOnly: true,
        maxAge: session.expires || 60 * 60 * 12, // 12 hours
        secure: isProduction,
        sameSite: "lax",
      });
      response.cookies.set("session_id", session.id, {
        httpOnly: true,
        maxAge: session.expires || 60 * 60 * 12, // 12 hours
        secure: isProduction,
        sameSite: "lax",
      });
      return response;
    } else {
      return NextResponse.json(
        {
          data: { ...verification },
          status: verified || false,
          message: "Auth error, please try again!",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        errors: { ...(error || error) },
        message: "Internal server error",
        status: false,
      },
      { status: 500 }
    );
  }
}
