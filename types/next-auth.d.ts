import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@/types';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: UserRole;
      proSlug?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    proSlug?: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    proSlug?: string;
    accessToken: string;
  }
}
