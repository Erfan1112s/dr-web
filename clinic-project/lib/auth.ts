import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        phone: {
          label: "شماره موبایل",
          type: "text",
        },
        password: {
          label: "رمز عبور",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password)
          return null;

        const user = await prisma.user.findUnique({
          where: {
            phone: credentials.phone as string,
          },
        });

        if (!user)
          return null;

        const ok = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!ok)
          return null;

        return {
          id: String(user.id),
          name: user.name,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export default handler;