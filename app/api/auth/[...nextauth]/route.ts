import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session }) {
      // Only return name and image
      return {
        ...session,
        user: {
          name: session.user?.name,
          image: session.user?.image,
        }
      }
    }
  }
})

export { handler as GET, handler as POST } 