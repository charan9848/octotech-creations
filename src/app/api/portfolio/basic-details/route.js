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
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const portfolioData = {
      artistId: session.user.artistid,
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

    return Response.json({ 
      message: "Basic details saved successfully!",
      success: true 
    });
  } catch (err) {
    return Response.json({ error: "Failed to save portfolio data." }, { status: 500 });
  }
}
