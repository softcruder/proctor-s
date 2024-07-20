import { randomBytes, createHash } from 'crypto';

/**
 * Generate a secure session token.
 * 
 * @param {string} userId - The user's unique identifier.
 * @returns {string} A secure session token.
 */
export const generateSessionToken = (userId: string): string => {
	// Generate a random 32-byte (256-bit) token using the crypto module
	const randomToken = randomBytes(32).toString('hex');

	// Combine the random token with the user ID and the current timestamp
	// Use a secure hash function to ensure the token is unique and tamper-proof
	const timestamp = Date.now().toString();
	const sessionToken = `${userId}_${timestamp}_${randomToken}`;

	// Optionally, hash the token for added security (this step is optional but recommended)
	// Here, we are using SHA-256 hash function
	const hashedToken = createHash('sha256').update(sessionToken).digest('hex');

	return hashedToken;
}
