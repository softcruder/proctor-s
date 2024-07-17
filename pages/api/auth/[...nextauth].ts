import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUser } from "@/utils/supabase";

interface UserWithID {
  id?: string;
  email?: string;
  password?: string;
}

const options: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        const { username }: { username: string } = credentials as { username: string };
        const { data, error } = await getUser({ username });

        if (error || !data) {
          return null
        }

        // assumes the user is authenticated successfully
        return { id: data.id, username: data.username };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt(params: { token: any; user: { id?: string } }) {
      const { token, user } = params;
      if (user && user.id) {
        (token as any).id = (user as UserWithID).id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token) {
        (session.user as any).id = (token as any).id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    verifyRequest: '/auth/verify-auth'
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, options);
export default handler;
