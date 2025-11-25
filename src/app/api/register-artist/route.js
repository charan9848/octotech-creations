import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const data = await request.json();

    // Connect to your database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");

    // Get max artists limit from settings
    const settings = await db.collection("settings").findOne({ key: "global_settings" });
    const MAX_ARTISTS = settings?.maxArtists || 4;

    // Check if email already exists
    const existingEmail = await users.findOne({ email: data.email });
    if (existingEmail) {
      return Response.json(
        { message: "Email already exists. Please use a different email." },
        { status: 400 }
      );
    }

    // Check if artistid already exists
    const existingArtistId = await users.findOne({ artistid: data.artistid });
    if (existingArtistId) {
      return Response.json(
        { message: "Artist ID already exists. Please choose a different ID." },
        { status: 400 }
      );
    }

    // Count current artists
    const artistCount = await db.collection("artists").countDocuments();
    if (artistCount >= MAX_ARTISTS) {
      return Response.json(
        { message: "Artist registration limit reached." },
        { status: 400 }
      );
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    data.createdAt = new Date(); // Add creation timestamp
    await users.insertOne(data);
    return Response.json({ message: "User registered!" });
  } catch (err) {
    console.error("Registration error:", err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = err.message.includes('email') ? 'email' : 'artistid';
      const message = field === 'email' 
        ? "Email already exists. Please use a different email."
        : "Artist ID already exists. Please choose a different ID.";
      
      return Response.json({ message }, { status: 400 });
    }
    
    return Response.json({ message: "Registration failed." }, { status: 500 });
  }
}