export const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT ===  'development';
export const rpName = process.env.NEXT_PUBLIC_RELAYING_PARTY_NAME || 'ProctorXpert';
export const rpID = isDev ? 'localhost' : process.env.NEXT_PUBLIC_RELAYING_PARTY_ID;
export const APPNAME = process.env.NEXT_PUBLIC_APP_NAME || 'ProctorXpert';
export const config = {
    matcher: ['/dashboard/:path*', '/test/:path*'], // Add your protected routes here
  }