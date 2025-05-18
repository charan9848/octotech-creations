import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const data = await request.json();
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");
    await users.insertOne(data);
    return Response.json({ message: "User registered!" });
  } catch (err) {
    return Response.json({ error: "Registration failed." }, { status: 500 });
  }
}