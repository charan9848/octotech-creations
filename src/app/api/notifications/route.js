import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ObjectId } from 'mongodb';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // If admin, fetch 'admin' notifications. If artist, fetch their specific notifications.
    const query = session.user.role === 'admin' 
      ? { recipient: 'admin' }
      : { recipient: session.user.id };

    const notifications = await db.collection("notifications")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, id } = body; // action: 'mark_read', 'clear_all'

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const query = session.user.role === 'admin' 
      ? { recipient: 'admin' }
      : { recipient: session.user.id };

    if (action === 'clear_all') {
      await db.collection("notifications").deleteMany(query);
      return NextResponse.json({ message: 'All notifications cleared' });
    }

    if (action === 'mark_read') {
      if (id) {
        await db.collection("notifications").updateOne(
          { _id: new ObjectId(id), ...query },
          { $set: { read: true } }
        );
      } else {
        // Mark all as read
        await db.collection("notifications").updateMany(
          query,
          { $set: { read: true } }
        );
      }
      return NextResponse.json({ message: 'Notifications updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
