import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Le route handler di Next.js possono esportare solo metodi HTTP:
// authOptions vive in lib/auth.ts.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
