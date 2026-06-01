import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      googleId?: string;
      sanctumToken?: string;
      laravelUserId?: number;
      phone?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleId?: string;
    sanctumToken?: string;
    laravelUserId?: number;
    phone?: string | null;
  }
}
