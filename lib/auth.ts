import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { apiFetch } from '@/lib/api';
import type { AuthResponse } from '@/types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenziali',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const res = await apiFetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          return {
            id: res.user.id,
            name: `${res.user.firstName} ${res.user.lastName}`.trim(),
            email: res.user.email,
            role: res.user.role,
            proSlug: res.user.proSlug,
            accessToken: res.token,
          };
        } catch {
          return null; // credenziali errate → login fallito
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.proSlug = user.proSlug;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.proSlug = token.proSlug;
      }
      return session;
    },
  },
  pages: {
    signIn: '/registrati',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
