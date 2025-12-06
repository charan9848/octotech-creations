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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const portfolio = await db.collection("portfolios").findOne({ 
      artistId: session.user.artistid 
    });

    if (!portfolio || !portfolio.experience) {
      return Response.json({ 
        experience: [
          { company: "", role: "", duration: "", description: "" }
        ]
      });
    }

    return Response.json({ experience: portfolio.experience });
  } catch (err) {
    return Response.json({ error: "Failed to fetch experience data." }, { status: 500 });
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
          experience: data.experience,
          updatedAt: new Date()
        },
        $setOnInsert: { 
          artistId: session.user.artistid,
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );

    // Notify Admin
    await createNotification({
      type: 'success',
      message: `Artist ${session.user.name || session.user.username || 'Unknown'} updated their portfolio experience.`,
      recipient: 'admin',
      relatedId: session.user.artistid,
      link: `/portfolio/${session.user.artistid}`
    });

    return Response.json({ 
      message: "Experience saved successfully!",
      success: true 
    });
  } catch (err) {
    return Response.json({ error: "Failed to save experience data." }, { status: 500 });
  }
}
