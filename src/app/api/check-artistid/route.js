import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { artistid } = await request.json();

    if (!artistid) {
      return Response.json({ error: "Artist ID is required." }, { status: 400 });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");

    // Check if artistid exists
    const existingArtistId = await users.findOne({ artistid });
    
    return Response.json({ 
      available: !existingArtistId,
      message: existingArtistId ? "Artist ID already exists" : "Artist ID is available"
    });

  } catch (err) {
    console.error("Artist ID check error:", err);
    return Response.json({ error: "Failed to check artist ID availability." }, { status: 500 });
  }
}
