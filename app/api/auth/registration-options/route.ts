import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { rpName, rpID, isDev, APPNAME } from '@/config';
import { checkExistingUser, getUser, updateUser } from '@/utils/supabase';
import { supabase } from '@/lib/Supabase/supabaseClient';
import { User } from '@/types/global';

const MAX_RETRIES = 3; // Define maximum retry attempts

export async function POST(req: NextRequest) {
	// if (req.method !== 'POST') {
	// 	return res.status(405).json({ error: 'Method not allowed' });
	// }

	const { username, email, user_type, userClass } = await req.json();

	try {
		// Check if user already exists
		const existingUser = await checkExistingUser(username, email);
		if (existingUser) {
			return NextResponse.json({ error: 'User already exists', redirect: '/auth/login' }, { status: 400 });
		}

		// Create new user
		const { data, error: createError } = await supabase
			.from('users')
			.insert({ username, email, user_type, class: userClass })
			.single();

		if (createError) {
			if (createError.code === '23505') { // Handle duplicate email error (PostgreSQL error code for unique violation)
				return NextResponse.json({ error: 'Duplicate email detected' }, { status: 400 });
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
				return NextResponse.json({ error: 'Unable to fetch user, please try again' }, { status: 400 });
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
			return NextResponse.json({ registrationOptions: options, userId: newUser.id }, { status: 200 });
		} else {
			console.warn('Missing user scenario');
			return NextResponse.json({ error: 'Unable to fetch user, please try again' }, { status: 400 });
		}
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
	}
}
