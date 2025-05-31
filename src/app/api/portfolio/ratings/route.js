import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    });    if (!portfolio || !portfolio.ratings) {
      return Response.json({ 
        ratings: {
          currentRating: 0,
          totalReviews: 0,
          ratingBreakdown: [
            { stars: 5, count: 0, percentage: 0 },
            { stars: 4, count: 0, percentage: 0 },
            { stars: 3, count: 0, percentage: 0 },
            { stars: 2, count: 0, percentage: 0 },
            { stars: 1, count: 0, percentage: 0 }
          ],
          reviews: []
        }
      });
    }

    return Response.json({ ratings: portfolio.ratings });
  } catch (err) {
    return Response.json({ error: "Failed to fetch ratings data." }, { status: 500 });
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
          ratings: data.ratings,
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
      message: "Ratings saved successfully!",
      success: true 
    });
  } catch (err) {
    return Response.json({ error: "Failed to save ratings data." }, { status: 500 });
  }
}
