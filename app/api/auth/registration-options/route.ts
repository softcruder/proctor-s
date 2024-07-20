import { NextApiRequest, NextApiResponse } from 'next';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { rpName, rpID, isDev, APPNAME } from '@/config';
import { checkExistingUser, getUser, updateUser } from '@/utils/supabase';
import { supabase } from '@/lib/Supabase/supabaseClient';
import { User } from '@/types/global';

const MAX_RETRIES = 3; // Define maximum retry attempts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { username, email, membership_type, userClass } = req.body;

	try {
		// Check if user already exists
		const existingUser = await checkExistingUser(username, email);
		if (existingUser) {
			return res.status(400).json({ error: 'User already exists', redirect: '/auth/login' });
		}

		// Create new user
		const { data, error: createError } = await supabase
			.from('users')
			.insert({ username, email, user_type: membership_type, class: userClass })
			.single();

		if (createError) {
			if (createError.code === '23505') { // Handle duplicate email error (PostgreSQL error code for unique violation)
				return res.status(400).json({ error: 'Duplicate email detected' });
			}
			throw createError;
		}

		let newUser: User | null = data; // Type assertion for clarity

		if (!newUser && !createError) {
			let retries = 0;
			while (retries < MAX_RETRIES && !newUser) {
				const { data } = await getUser({ username });
				newUser = data;
				retries++;
			}
			if (!newUser) {
				console.warn('Unable to fetch user after retries');
				return res.status(400).json({ error: 'Unable to fetch user, please try again' });
			}
		}

		const options = await generateRegistrationOptions({
			rpName: rpName || APPNAME,
			rpID: isDev ? 'localhost' : rpID || 'proctoxpert.vercel.app',
			userName: username,
			attestationType: 'none',
			authenticatorSelection: {
				residentKey: 'preferred',
				userVerification: 'preferred',
			},
			challenge: new Uint8Array(64), // Generate a random challenge
			userID: newUser ? newUser.id : '', // Use the newUser ID or an empty string as fallback
		});

		// Save the challenge in the database
		if (newUser) {
			await updateUser({ challenge: options.challenge, user_id: newUser.id });
			return res.status(200).json({ registrationOptions: options, userId: newUser.id });
		} else {
			console.warn('Missing user scenario');
			return res.status(400).json({ error: 'Unable to fetch user, please try again' });
		}
	} catch (error) {
		console.error('Registration error:', error);
		return res.status(500).json({ error: 'Registration failed' });
	}
}
