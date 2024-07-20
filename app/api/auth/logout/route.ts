import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/Supabase/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    const { session_id } = req.body;
  
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session_id);
  
      if (error) {
        throw error;
      }
  
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }