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
      async authorize(credentials, req) {
        // Extract IP and User Agent for security logging
        let ip = "Unknown";
        let userAgent = "Unknown";
        
        try {
          if (req) {
            // Handle both standard Node request and headers object
            const headers = req.headers;
            if (headers) {
              const forwarded = typeof headers.get === 'function' ? headers.get('x-forwarded-for') : headers['x-forwarded-for'];
              ip = forwarded ? forwarded.split(',')[0] : (req.connection?.remoteAddress || req.socket?.remoteAddress);
              
              const ua = typeof headers.get === 'function' ? headers.get('user-agent') : headers['user-agent'];
              userAgent = ua || "Unknown";
            }
          }
        } catch (e) {
          console.error("Error extracting request details:", e);
        }

        // Check for Admin Credentials
        if (
          credentials.artistid === process.env.ADMIN_USERNAME &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          // Log Admin Login
          try {
             const client = await clientPromise;
             const db = client.db(process.env.MONGODB_DB);
             await db.collection("login_logs").insertOne({
              artistId: "admin",
              username: "Administrator",
              role: "admin",
              timestamp: new Date(),
              action: "LOGIN",
              ip: ip,
              userAgent: userAgent
            });
          } catch(e) { console.error("Admin log error", e); }

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

        // Log the login timing
        try {
          const now = new Date();
          // Update lastLogin in artists collection
          await db.collection("artists").updateOne(
            { _id: user._id },
            { 
              $set: { 
                lastLogin: now,
                lastIp: ip,
                lastUserAgent: userAgent
              } 
            }
          );

          // Add to login_logs collection for history
          await db.collection("login_logs").insertOne({
            artistId: user.artistid,
            username: user.username,
            role: user.role || "artist",
            timestamp: now,
            action: "LOGIN",
            ip: ip,
            userAgent: userAgent
          });
        } catch (error) {
          console.error("Error logging login time:", error);
        }

        return { id: user._id, artistid: user.artistid, name: user.username, email: user.email, role: user.role || "artist" };
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
