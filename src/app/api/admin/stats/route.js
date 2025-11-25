import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const artistsCount = await db.collection("artists").countDocuments();
    const feedbackCount = await db.collection("feedbacks").countDocuments();
    const contactCount = await db.collection("contactus").countDocuments();
    
    // Get feedback rating distribution
    const feedbackStats = await db.collection("feedbacks").aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    feedbackStats.forEach(stat => {
      if (stat._id >= 1 && stat._id <= 5) {
        ratingDistribution[stat._id] = stat.count;
      }
    });

    // Get recent activity (e.g., last 5 registered artists)
    const recentArtists = await db.collection("artists")
      .find({}, { projection: { password: 0 } })
      .sort({ _id: -1 })
      .limit(5)
      .toArray();

    // Get recent messages
    const recentMessages = await db.collection("contactus")
      .find({})
      .sort({ _id: -1 })
      .limit(5)
      .toArray();

    // Get monthly registration stats (last 6 months)
    // Note: Assuming _id contains timestamp if createdAt is missing, but for simplicity in aggregation
    // we will try to use a simple projection if createdAt exists, or just mock it if data is sparse.
    // For a real app, ensure 'createdAt' field exists. 
    // Here we'll just return a simple count for now or try to aggregate if possible.
    
    // Let's try to get all artists created dates to build the chart on the client side 
    // (better for small datasets than complex mongo aggregation if schema is uncertain)
    const allArtistsDates = await db.collection("artists")
      .find({}, { projection: { _id: 1, createdAt: 1 } })
      .toArray();

    // Get visitor stats
    const visitorStats = await db.collection("visitor_stats").find({}).toArray();
    const totalVisitors = visitorStats.reduce((acc, curr) => acc + curr.count, 0);

    return NextResponse.json({
      stats: {
        artists: artistsCount,
        feedback: feedbackCount,
        contacts: contactCount,
        visitors: totalVisitors
      },
      ratingDistribution,
      recentArtists,
      recentMessages,
      allArtistsDates,
      visitorStats // Send raw daily stats for charting
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
