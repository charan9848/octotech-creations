import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Fetch artists and join with portfolios to get the latest portfolio image
    const artists = await db.collection("artists").aggregate([
      {
        $lookup: {
          from: "portfolios",
          localField: "artistid",
          foreignField: "artistId",
          as: "portfolio"
        }
      },
      {
        $project: {
          username: 1, 
          role: 1, 
          artistid: 1, 
          profileImage: 1, 
          image: 1,
          email: 1,
          createdAt: 1,
          // Get portfolio image from the first matched portfolio (should be only one)
          portfolioImage: { $arrayElemAt: ["$portfolio.basicDetails.portfolioImage", 0] },
          // Get bio from portfolio if available
          portfolioBio: { $arrayElemAt: ["$portfolio.basicDetails.bio", 0] }
        }
      }
    ]).toArray();

    // Map to prefer portfolio image if available
    const teamMembers = artists.map(artist => ({
      ...artist,
      // Prefer portfolio image, then profileImage, then image
      image: artist.portfolioImage || artist.profileImage || artist.image,
      // Prefer Profile Bio (from artists collection) -> then Portfolio Bio
      // Why? Because "Profile" page explicitly has "Bio (For Our Team Section)"
      // So if that is set, use it. If not, fallback to portfolio bio.
      bio: artist.bio || artist.portfolioBio
    }));

    return NextResponse.json(teamMembers, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
