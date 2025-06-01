import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");

    // Check if email exists
    const existingEmail = await users.findOne({ email });
    
    return Response.json({ 
      available: !existingEmail,
      message: existingEmail ? "Email already exists" : "Email is available"
    });

  } catch (err) {
    console.error("Email check error:", err);
    return Response.json({ error: "Failed to check email availability." }, { status: 500 });
  }
}
