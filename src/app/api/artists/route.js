import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = db.collection("artists");
    const artists = await users.find({}).toArray();
    return Response.json(artists);
  } catch (err) {
    return Response.json({ error: "Failed to fetch artists." }, { status: 500 });
  }
}