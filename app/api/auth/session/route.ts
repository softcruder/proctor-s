import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/Supabase/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session_id = req.cookies['session_id'];

  if (!session_id) {
    return res.status(401).json({ message: 'No session found' });
  }

  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*, users(*)')
      .eq('id', session_id)
      .single();

    if (error || !session) {
      throw new Error('Session not found');
    }

    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('sessions').delete().eq('id', session_id);
      throw new Error('Session expired');
    }

    res.status(200).json({
      user: {
        id: session.users.id,
        username: session.users.username,
        email: session.users.email,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}