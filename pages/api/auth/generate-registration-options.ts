import { NextApiRequest, NextApiResponse } from 'next';
import { generateRegistrationOptions, } from '@simplewebauthn/server';
import { rpName, rpID } from '@/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  let errors = {};

  if (typeof username !== 'string') {
    errors = { ...errors, username: "Invalid Username" };
    return res.status(400).json({ error: errors });
  }

  const options: PublicKeyCredentialCreationOptions = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: username,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'none',
    // See "Guiding use of authenticators via authenticatorSelection" below
    authenticatorSelection: {
      // Defaults
      residentKey: 'preferred',
      userVerification: 'preferred',
      // Optional
      authenticatorAttachment: 'platform',
    },
  });

  res.status(200).json(options);
}
