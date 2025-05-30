import clientPromise from "@/lib/mongodb";

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");
    console.log("Looking for artistid:", id);

    // Query by artistid (string)
    const artist = await users.findOne({ artistid: id });
    if (!artist) {
      return Response.json({ error: "Artist not found." }, { status: 404 });
    }
    return Response.json(artist);
  } catch (err) {
    return Response.json({ error: "Failed to fetch artist." }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const { id } = await context.params;
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");
    
    const updateData = await request.json();
    console.log("Updating artist with artistid:", id);
    console.log("Update data:", updateData);

    // Validate required fields
    if (!updateData.username || !updateData.email) {
      return Response.json({ error: "Username and email are required." }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      return Response.json({ error: "Invalid email format." }, { status: 400 });
    }

    // Check if artist exists
    const existingArtist = await users.findOne({ artistid: id });
    if (!existingArtist) {
      return Response.json({ error: "Artist not found." }, { status: 404 });
    }

    // Update the artist profile
    const result = await users.updateOne(
      { artistid: id },
      { 
        $set: {
          username: updateData.username,
          email: updateData.email,
          image: updateData.image || existingArtist.image,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Artist not found." }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return Response.json({ message: "No changes made to profile." }, { status: 200 });
    }

    // Return updated artist data
    const updatedArtist = await users.findOne({ artistid: id });
    return Response.json({ 
      message: "Profile updated successfully",
      artist: updatedArtist
    });

  } catch (err) {
    console.error("Profile update error:", err);
    return Response.json({ error: "Failed to update profile." }, { status: 500 });
  }
}