import type { NextAuthOptions } from 'next-auth';

// TODO: add providers
// Options to consider:
//   - CredentialsProvider — email/password against POST /api/auth/login
//   - GoogleProvider — OAuth login

export const authOptions: NextAuthOptions = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // TODO: attach role to JWT token
        // token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // TODO: attach role to session user
        // (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/registrati',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
