import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    requiresPasswordSetup?: boolean;
  }

  interface User extends DefaultUser {
    id: string;
  }
}

export {};
