
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Use `useSession()` or `unstable_getServerSession()` to get the NextAuth session.
 
// const { supabaseAccessToken } = session
 
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//   {
    
//   }
// )
// // Now you can query with RLS enabled.
// const { data, error } = await supabase.from("users").select("*")
