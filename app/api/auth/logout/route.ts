import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib";

export async function DELETE(req: NextRequest) {
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