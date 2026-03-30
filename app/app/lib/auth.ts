import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prismaClient } from "@/app/lib/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const existingUser = await prismaClient.user.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);

          const newUser = await prismaClient.user.create({
            data: {
              email: credentials.email,
              name: credentials.username,
              password: hashedPassword,
              provider: "Credentials",
            },
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          };
        }

        if (!existingUser.password) {
          throw new Error("User has no password");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          existingUser.password
        );

        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await prismaClient.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prismaClient.user.create({
            data: {
              email: user.email,
              provider: "Google",
            },
          });
        }
      }
      return true;
    },

    async session({ session, token: _token }) {
      if (session.user && session.user.email) {
        const dbUser = await prismaClient.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
