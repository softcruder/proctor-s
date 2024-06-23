import { NextApiRequest, NextApiResponse } from 'next';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { rpID, isDev } from '@/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { body } = req;

    const origin = ['localhost', 'http://localhost:3000']; // Define the origin variable with the appropriate value
    if (body.origin) {
        const { origin: currentOrigin } = body;
        origin.push(currentOrigin);
    };

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: body?.regOptions,
            expectedChallenge: body?.challenge?.toString(),
            expectedOrigin: origin,
            expectedRPID: rpID || isDev ? 'localhost' : 'scrud-proctor-s',
        });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: error });
    }

    const { verified } = verification;

    res.status(200).json({ data: { ...verification }, status: verified, message: 'Registration Successful!' });
}