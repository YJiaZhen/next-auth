import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import PostgresAdapter from "../../../lib/postgresAdapter"

export default NextAuth({
  adapter: PostgresAdapter(),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider_id = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.uid;
        session.accessToken = token.accessToken;
        session.user.provider_id = token.provider_id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',  // 將登入頁面設置為首頁
    error: '/auth/error', // 錯誤頁面路徑
  },
  debug: process.env.NODE_ENV === 'development',
})