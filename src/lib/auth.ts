import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // Block login for deactivated users
        if (!user.isActive) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          officeId: user.officeId,
          themeMode: user.themeMode,
          isActive: user.isActive,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: populate token from user object
        token.sub = user.id;
        token.role = (user as any).role;
        token.officeId = (user as any).officeId;
        token.themeMode = (user as any).themeMode;
        token.isActive = (user as any).isActive;
      } else if (token.sub) {
        // Subsequent requests: refresh role, officeId, themeMode, isActive from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, officeId: true, themeMode: true, isActive: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.officeId = dbUser.officeId;
          token.themeMode = dbUser.themeMode;
          token.isActive = dbUser.isActive;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.officeId = token.officeId as string | null;
        session.user.themeMode = token.themeMode as string;
      }
      return session;
    },
  },
};
