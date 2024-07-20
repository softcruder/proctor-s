import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/Supabase/supabaseClient';
import { createSession } from '../../../app/auth/session';
import { getUser } from '@/utils/supabase';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            // Get the record data from the request body
            const { username, email, rememberMe } = req.body;
            const now = new Date().toISOString();

            // Insert the record into the "users" table
            const { data, error } = await getUser({ username })

            if (error) {
                throw error;
            }
            console.log(data)
            if (rememberMe && data) {
                createSession(data.id);
            }

            // Return the inserted record
            res.status(200).json(data);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Failed to insert record' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}