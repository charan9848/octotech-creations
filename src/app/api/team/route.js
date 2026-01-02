import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Fetch all artists, projecting necessary fields for team display
    const artists = await db.collection("artists")
      .find({}, { 
        projection: { 
          username: 1, 
          role: 1, 
          artistid: 1, 
          profileImage: 1, 
          image: 1,
          bio: 1,
          instagram: 1,
          _id: 0 
        } 
      })
      .toArray();

    return NextResponse.json(artists);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
