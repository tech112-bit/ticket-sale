import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

const isDev = process.env.NODE_ENV === "development";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  debug: isDev,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() || "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.password) {
          if (isDev) console.warn("[auth] user not found for email", email);
          return null;
        }

        if (!user.emailVerified) {
          if (isDev) console.warn("[auth] email not verified for", email);
          return null;
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
          if (isDev) console.warn("[auth] invalid password for email", email);
          return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  // In dev we read the secret from env; NextAuth will warn if missing.
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
