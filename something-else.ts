import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from './lib/Supabase/supabaseClient'

export async function middleware(request: NextRequest) {
  // Get the session token from the cookies
  const sessionToken = request.cookies.get('session_token')?.value

  if (!sessionToken) {
    // Redirect to login if there's no session token
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Verify the session token
  const { data: session, error } = await supabase
    .from('session')
    .select('*')
    .eq('token', sessionToken)
    .single()

  if (error || !session) {
    // Clear the invalid session cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session_token')
    return response
  }

  // Optionally, you can add the user info to the request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session.user_id)

  // You can also update the session's last_used timestamp here if needed

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}


