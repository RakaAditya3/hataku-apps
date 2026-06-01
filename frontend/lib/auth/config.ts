import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const internalApiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, trigger, session }) {
      // First sign-in: call Laravel to create/find user and get Sanctum token
      if (account) {
        try {
          const res = await fetch(`${internalApiUrl}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              google_id:  account.providerAccountId,
              email:      token.email,
              name:       token.name,
              avatar_url: token.picture ?? null,
            }),
          });
          const data = await res.json();
          if (data.success) {
            token.sanctumToken   = data.data.token;
            token.laravelUserId  = data.data.user.id;
            token.phone          = data.data.user.phone;
            token.googleId       = account.providerAccountId;
          }
        } catch (e) {
          console.error("[auth] Laravel handshake failed:", e);
        }
      }

      // Session update triggered from client (e.g. after updateProfile)
      if (trigger === "update" && session?.phone !== undefined) {
        token.phone = session.phone;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.googleId      = token.googleId;
      session.user.sanctumToken  = token.sanctumToken;
      session.user.laravelUserId = token.laravelUserId;
      session.user.phone         = token.phone;
      return session;
    },
  },
};
