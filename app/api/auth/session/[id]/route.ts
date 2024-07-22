// import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/Supabase/supabaseClient';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('id');

  // const session_id = req.cookies.get('session_id');
  // const allcookies = req.cookies.getAll();
  // console.log(session_id, allcookies);
  // const session_id = id;

  if (!userId) {
    return NextResponse.json({ message: 'No session found' }, { status: 401 });
  }

  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*, users(*)')
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      throw new Error('Session not found');
    }

    if (new Date(session.expires) < new Date()) {
      await supabase.from('sessions').delete().eq('id', session.id);
      throw new Error('Session expired');
    }

    return NextResponse.json({
      user: {
        id: session.users.id,
        username: session.users.username,
        email: session.users.email,
      },
      session
    }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
  }
}