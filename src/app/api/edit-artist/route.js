import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request) {
  try {
    const data = await request.json();
    const { _id, ...updateFields } = data;

    if (!_id) {
      return Response.json({ error: "User ID is required." }, { status: 400 });
    }

    // Hash password if present
    if (updateFields.password) {
      const bcrypt = await import("bcryptjs");
      updateFields.password = await bcrypt.hash(updateFields.password, 10);
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");

    // Only allow updating these fields
    const allowedFields = ["artistid", "username", "email", "password", "image"];
    const safeUpdate = {};
    for (const key of allowedFields) {
      if (updateFields[key] !== undefined) {
        safeUpdate[key] = updateFields[key];
      }
    }

    const result = await users.updateOne(
      { _id: new ObjectId(_id) },
      { $set: safeUpdate }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    return Response.json({ message: "User updated successfully." });
  } catch (err) {
    return Response.json({ error: "Update failed." }, { status: 500 });
  }
}