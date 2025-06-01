import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const portfolio = await db.collection("portfolios").findOne({ 
      artistId: session.user.artistid 
    });

    if (!portfolio || !portfolio.artworks) {
      return Response.json({ 
        artworks: [
          { title: "", description: "", category: "", imageUrl: "", year: "", medium: "" }
        ]
      });
    }

    return Response.json({ artworks: portfolio.artworks });
  } catch (err) {
    return Response.json({ error: "Failed to fetch artworks data." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const result = await db.collection("portfolios").updateOne(
      { artistId: session.user.artistid },
      { 
        $set: { 
          artworks: data.artworks,
          updatedAt: new Date()
        },
        $setOnInsert: { 
          artistId: session.user.artistid,
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );

    return Response.json({ 
      message: "Artworks saved successfully!",
      success: true 
    });
  } catch (err) {
    return Response.json({ error: "Failed to save artworks data." }, { status: 500 });
  }
}
