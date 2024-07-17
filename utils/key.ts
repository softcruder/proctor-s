import { randomBytes, pbkdf2 } from 'crypto';

export const generateSecretKey = () => {

    const password = '@Softcruder.ProctorS24';
    const salt = randomBytes(16); // Generate a random salt
    const iterations = 100000; // Adjust iteration count for security vs. performance

    pbkdf2(password, salt, iterations, 16, 'sha256', (err, derivedKey) => {
        if (err) throw err;
        const SECRET_KEY = derivedKey.toString('hex');
        console.log('Your secret key:', SECRET_KEY);
        // Use the secret key for further processing
    });
};