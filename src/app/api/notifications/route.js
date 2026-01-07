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

    const notificationsPromise = db.collection("notifications")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    // Also fetch unread chat messages to include as "notifications"
    let messagesQuery = {};
    if (session.user.role === 'admin') {
      // Admin sees messages FROM artists that are unread
      messagesQuery = { senderType: 'artist', read: false };
    } else {
      // Artist sees messages FROM admin matching their ID that are unread
      messagesQuery = { 
        artistId: session.user.artistid, 
        senderType: 'admin', 
        read: false 
      };
    }
    
    // We only need a few latest unread messages to notify about
    const messagesPromise = db.collection("messages")
      .find(messagesQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const [notifications, unreadMessages] = await Promise.all([notificationsPromise, messagesPromise]);

    // Format messages as notifications
    const messageNotifications = unreadMessages.map(msg => ({
      _id: msg._id,
      recipient: session.user.role === 'admin' ? 'admin' : session.user.id,
      title: `New Message from ${msg.senderName || 'Support'}`,
      message: msg.message,
      type: 'info', // Use info style
      read: false,
      timestamp: msg.createdAt,
      isMessage: true, // Flag to identify origin
      link: session.user.role === 'admin' 
        ? `/admin/dashboard/chat?artistId=${msg.artistId}` 
        : `/artist-dashboard/chat`
    }));

    // Combine and sort
    const combined = [...messageNotifications, ...notifications].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return NextResponse.json(combined);
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

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only allow admin to send manual notifications for now
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { recipient, title, message, type } = body;

    if (!recipient || !message) {
      return NextResponse.json({ error: 'Recipient and message are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const newNotification = {
      recipient, // artist ID or 'admin'
      title: title || 'New Message',
      message,
      type: type || 'info', // success, error, warning, info
      read: false,
      timestamp: new Date().toISOString()
    };

    const result = await db.collection("notifications").insertOne(newNotification);

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Notification sent successfully' 
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
