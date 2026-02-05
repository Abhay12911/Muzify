import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { prismaClient } from "@/app/lib/db";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        if (!credentials?.password || !credentials?.email) {
          throw new Error("Missing credentials");
        }

        // 🔍 Check if user already exists
        const existingUser = await prismaClient.user.findUnique({
          where: { email: credentials.email }
        });

        // 🟢 SIGN UP FLOW
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);

          const newUser = await prismaClient.user.create({
            data: {
              email: credentials.email,
              name: credentials.username,
              password: hashedPassword,
              provider: "Credentials"
            }
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name
          };
        }

        // 🔵 LOGIN FLOW
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
          name: existingUser.name
        };
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const existingUser = await prismaClient.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          await prismaClient.user.create({
            data: {
              email: user.email,
              provider: "Google"
            }
          });
        }
      }
      return true;
    }
  },

  session: {
    strategy: "jwt"
  },

  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
