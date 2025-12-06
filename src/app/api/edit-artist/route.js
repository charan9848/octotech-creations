import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/db-notifications";

export async function PUT(request) {
  try {
    const data = await request.json();
    const { _id, ...updateFields } = data;

    if (!_id) {
      return Response.json({ error: "User ID is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");

    // Get existing artist data
    const existingArtist = await users.findOne({ _id: new ObjectId(_id) });
    if (!existingArtist) {
      return Response.json({ error: "Artist not found." }, { status: 404 });
    }

    // Check for email uniqueness if email is being updated
    if (updateFields.email && updateFields.email !== existingArtist.email) {
      const emailExists = await users.findOne({ 
        email: updateFields.email, 
        _id: { $ne: new ObjectId(_id) } // Exclude current artist
      });
      if (emailExists) {
        return Response.json({ error: "Email already exists. Please use a different email." }, { status: 400 });
      }
    }

    // Check for artistid uniqueness if artistid is being updated
    if (updateFields.artistid && updateFields.artistid !== existingArtist.artistid) {
      const artistIdExists = await users.findOne({ 
        artistid: updateFields.artistid, 
        _id: { $ne: new ObjectId(_id) } // Exclude current artist
      });
      if (artistIdExists) {
        return Response.json({ error: "Artist ID already exists. Please choose a different ID." }, { status: 400 });
      }
    }

    // Hash password if present
    if (updateFields.password) {
      const bcrypt = await import("bcryptjs");
      updateFields.password = await bcrypt.hash(updateFields.password, 10);
    }

    // Only allow updating these fields
    const allowedFields = ["artistid", "username", "email", "password", "image"];
    const safeUpdate = {};
    for (const key of allowedFields) {
      if (updateFields[key] !== undefined) {
        safeUpdate[key] = updateFields[key];
      }
    }

    // Add updatedAt timestamp
    safeUpdate.updatedAt = new Date();

    const result = await users.updateOne(
      { _id: new ObjectId(_id) },
      { $set: safeUpdate }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    // Notify Admin
    await createNotification({
      type: 'info',
      message: `Artist ${existingArtist.username} updated their profile details.`,
      recipient: 'admin',
      relatedId: existingArtist.artistid,
      link: `/admin/dashboard/artists?search=${existingArtist.artistid}`
    });

    return Response.json({ message: "User updated successfully." });  } catch (err) {
    console.error("Update error:", err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = err.message.includes('email') ? 'email' : 'artistid';
      const message = field === 'email' 
        ? "Email already exists. Please use a different email."
        : "Artist ID already exists. Please choose a different ID.";
      
      return Response.json({ error: message }, { status: 400 });
    }
    
    return Response.json({ error: "Update failed." }, { status: 500 });
  }
}