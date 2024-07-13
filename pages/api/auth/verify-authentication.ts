import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isDev, rpID } from "@/config";
import { getPasskey, getUser } from "@/utils/supabase";

interface BodyData {
  auth_options: any; // Adjust the type as per your auth_options structure
  id: string;
  challenge?: string;
  origin?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body } = req as { body: BodyData }; // Type assertion for body as BodyData
  const { auth_options, id: user_id, challenge } = body || { challenge: '' };

  if (typeof user_id !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const { data: user, error } = await getUser({ user_id });
  const { data: passkey, error: passkeyError } = await getPasskey({
    internal_user_id: user_id,
    single: true,
  });

  if (error || !user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (passkeyError || !passkey) {
    return res.status(404).json({ error: "Passkey not found" });
  }
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'http'; // Handle cases with proxy

  const origin: string[] = ["localhost", "http://localhost:3000", `${protocol}://${host}`]; // Define the origin variable as string array

  if (body.origin) {
    origin.push(body.origin); // Push currentOrigin to origin array
  }

  const hexString = passkey.cred_public_key;

  // Remove the leading '\x' and convert hex to ASCII
  const cleanedHexString = hexString?.toString()?.replace(/\\x/g, ""); // Remove '\x' if present

  // Convert hexadecimal string to ASCII
  const jsonString = Buffer.from(cleanedHexString || '', "hex").toString("utf8");

  // Parse the JSON string into an object
  const jsonObject = JSON.parse(jsonString);

  // Convert BYTEA to Uint8Array
  const publicKeyBuffer = jsonObject?.data || jsonObject; // Adjust this based on your actual data structure
  const unit8key = new Uint8Array(Object.values(publicKeyBuffer));

  try {
    const verification = await verifyAuthenticationResponse({
      response: auth_options, // Assuming 'response' is the correct field to use from 'credential'
      expectedChallenge: challenge || user?.challenge || '',
      expectedOrigin: origin,
      expectedRPID: rpID || (isDev ? "localhost" : "scrud-proctor-s"),
      authenticator: {
        credentialID: passkey.cred_id,
        credentialPublicKey: unit8key,
        counter: passkey?.counter || 0,
        transports: user?.auth_options?.response?.transports,
      },
    });

    const { verified } = verification;

    if (verified) {
      // Handle successful authentication (e.g., set session, return success response)
      res.status(200).json({
        data: { ...verification },
        status: verified,
        message: "Authentication Successful!",
      });
    } else {
      res.status(400).json({
        data: { ...verification },
        status: verified || false,
        message: "Auth error, please try again!",
      });
    }
  } catch (error: any) {
    res.status(500).json({ errors: {...error || error} });
  }
};