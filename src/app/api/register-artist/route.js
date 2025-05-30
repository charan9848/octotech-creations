import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

const MAX_ARTISTS = 4; // Set your limit

export async function POST(request) {
  try {
    const data = await request.json();
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    // Connect to your database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");

    // Count current artists
    const artistCount = await db.collection("artists").countDocuments();
    if (artistCount >= MAX_ARTISTS) {
      return Response.json(
        { error: "Artist registration limit reached." },
        { status: 400 }
      );
    }

    await users.insertOne(data);
    return Response.json({ message: "User registered!" });
  } catch (err) {
    return Response.json({ error: "Registration failed." }, { status: 500 });
  }
}