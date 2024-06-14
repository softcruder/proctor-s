export const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT ===  'development';
export const rpName = process.env.NEXT_PUBLIC_RELAYING_PARTY_NAME;
export const rpID = isDev ? 'localhost' : process.env.NEXT_PUBLIC_RELAYING_PARTY_NAME