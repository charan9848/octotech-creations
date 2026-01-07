import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/db-notifications";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine target artist ID (allow admin override)
    const { searchParams } = new URL(request.url);
    let targetArtistId = session.user.artistid;
    if (session.user.role === 'admin' && searchParams.get('artistId')) {
      targetArtistId = searchParams.get('artistId');
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const portfolio = await db.collection("portfolios").findOne({ 
      artistId: targetArtistId 
    });

    if (!portfolio) {
      return Response.json({ 
        basicDetails: {
          bio: "",
          quotation: "",
          portfolioImage: "",
          contactEmail: "",
          phone: "",
          location: ""
        }
      });
    }

    return Response.json({ basicDetails: portfolio.basicDetails || {} });
  } catch (err) {
    return Response.json({ error: "Failed to fetch portfolio data." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // Determine target artist ID (allow admin override)
    const { searchParams } = new URL(request.url);
    let targetArtistId = session.user.artistid;
    if (session.user.role === 'admin' && searchParams.get('artistId')) {
      targetArtistId = searchParams.get('artistId');
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const portfolioData = {
      artistId: targetArtistId,
      basicDetails: data,
      updatedAt: new Date()
    };

    const result = await db.collection("portfolios").updateOne(
      { artistId: session.user.artistid },
      { 
        $set: portfolioData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    // Notify Admin
    await createNotification({
      type: 'success',
      message: `Artist ${session.user.name || session.user.username || 'Unknown'} updated their portfolio basic details.`,
      recipient: 'admin',
      relatedId: session.user.artistid,
      link: `/portfolio/${session.user.artistid}`
    });

    return Response.json({ 
      message: "Basic details saved successfully!",
      success: true 
    });
  } catch (err) {
    return Response.json({ error: "Failed to save portfolio data." }, { status: 500 });
  }
}
