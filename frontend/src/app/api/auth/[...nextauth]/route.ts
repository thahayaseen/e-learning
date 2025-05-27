import { Session } from "inspector/promises";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account && profile && profile.email) {
        if (account.provider === "google") {
           return true;
        }
        return true;
      }
      return false;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accsessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accsessToken = token.accsessToken;

      return session;
    },
  },
  secret:process.env.AUTH_SECRET
});

export { handler as GET, handler as POST };
