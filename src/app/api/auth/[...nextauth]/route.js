import NextAuth from "next-auth";
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
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const user = await db.collection("artists").findOne({ artistid: credentials.artistid });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: user._id, artistid: user.artistid, name: user.username, email: user.email };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/artist-login" }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };