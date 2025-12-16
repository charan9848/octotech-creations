import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Fetch all conversations for admin
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Get all unique conversations with latest message and unread count
    const conversations = await db.collection("messages").aggregate([
      {
        $group: {
          _id: "$artistId",
          lastMessage: { $last: "$message" },
          lastMessageTime: { $last: "$createdAt" },
          lastSenderType: { $last: "$senderType" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$senderType", "artist"] }, { $eq: ["$read", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ]).toArray();

    // Get artist details for each conversation
    const artistIds = conversations.map(c => c._id);
    const artists = await db.collection("artists")
      .find({ artistid: { $in: artistIds } })
      .project({ artistid: 1, username: 1, profileImage: 1 })
      .toArray();

    const artistMap = {};
    artists.forEach(a => {
      artistMap[a.artistid] = a;
    });

    const enrichedConversations = conversations.map(c => ({
      artistId: c._id,
      artistName: artistMap[c._id]?.username || 'Unknown Artist',
      artistImage: artistMap[c._id]?.profileImage || null,
      lastMessage: c.lastMessage,
      lastMessageTime: c.lastMessageTime,
      lastSenderType: c.lastSenderType,
      unreadCount: c.unreadCount
    }));

    return NextResponse.json({ conversations: enrichedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
