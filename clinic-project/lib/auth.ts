// lib/auth.ts
import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Create a separate Prisma client for auth (with adapter for query engine)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapterPg = new PrismaPg(pool);
const authPrisma = new PrismaClient({
  adapter: adapterPg,
});

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(authPrisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: 'شماره موبایل', type: 'text' },
        password: { label: 'رمز عبور', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const user = await authPrisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        return {
          id: String(user.id),
          name: user.name,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);