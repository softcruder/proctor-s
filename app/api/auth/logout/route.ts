import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/lib/Supabase/supabaseClient";
import { clearSession, getSession } from "@/lib";

export async function GET(req: NextRequest) {
    // if (req.method !== 'POST') {
    //   return res.status(405).json({ message: 'Method not allowed' });
    // }
  
    // const { user_id } = req.json();
  
    try {
      const session = await getSession();
      if (!session) {
        throw new Error('No session found')
      }
      await clearSession(session?.id)
  
      // if (error) {
      //   throw error;
      // }
  
      NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    } catch (error) {
      console.error('Logout error:', error);
      NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }