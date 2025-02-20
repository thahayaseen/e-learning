import axios from "axios";
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
          console.log(profile);
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
    async session({ session, token }) {
      session.accessToken = token.accsessToken;
    
      
      return session;
    }
  }
});

export { handler as GET, handler as POST };


