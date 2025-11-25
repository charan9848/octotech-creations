import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        artistid: { label: "Artist ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check for Admin Credentials
        if (
          credentials.artistid === process.env.ADMIN_USERNAME &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "admin",
            artistid: "admin",
            name: "Administrator",
            email: "admin@octotech.com",
            role: "admin",
          };
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const user = await db.collection("artists").findOne({ artistid: credentials.artistid });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: user._id, artistid: user.artistid, name: user.username, email: user.email, role: "artist" };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/artist-login" },
  callbacks: {
    async session({ session, token }) {
      session.user.artistid = token.artistid;
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.artistid = user.artistid || user._id?.toString();
        token.role = user.role || "artist";
      }
      return token;
    }
  }
};
