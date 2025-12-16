import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Fetch messages for a conversation
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artistId');
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    let query = {};
    
    if (session.user.role === 'admin') {
      // Admin can see messages with specific artist
      if (artistId) {
        query = { artistId: artistId };
      }
    } else {
      // Artist can only see their own messages
      query = { artistId: session.user.artistid };
    }

    const messages = await db.collection("messages")
      .find(query)
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { artistId, message } = await request.json();
    
    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const isAdmin = session.user.role === 'admin';
    const targetArtistId = isAdmin ? artistId : session.user.artistid;

    if (!targetArtistId) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    const newMessage = {
      artistId: targetArtistId,
      senderType: isAdmin ? 'admin' : 'artist',
      senderName: isAdmin ? 'Admin' : session.user.username,
      senderId: isAdmin ? 'admin' : session.user.artistid,
      message: message.trim(),
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection("messages").insertOne(newMessage);

    return NextResponse.json({ 
      success: true, 
      message: { ...newMessage, _id: result.insertedId }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Mark messages as read
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { artistId } = await request.json();
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const isAdmin = session.user.role === 'admin';
    const targetArtistId = isAdmin ? artistId : session.user.artistid;

    // Mark messages as read (opposite sender type)
    await db.collection("messages").updateMany(
      { 
        artistId: targetArtistId,
        senderType: isAdmin ? 'artist' : 'admin',
        read: false
      },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Clear messages
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artistId');
    const clearAll = searchParams.get('clearAll') === 'true';
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const isAdmin = session.user.role === 'admin';

    if (isAdmin && clearAll) {
      // Admin can clear all messages
      await db.collection("messages").deleteMany({});
      return NextResponse.json({ success: true, message: 'All messages cleared' });
    } else if (isAdmin && artistId) {
      // Admin can clear messages for specific artist
      await db.collection("messages").deleteMany({ artistId: artistId });
      return NextResponse.json({ success: true, message: 'Conversation cleared' });
    } else if (!isAdmin) {
      // Artist can clear their own messages
      const targetArtistId = session.user.artistid;
      await db.collection("messages").deleteMany({ artistId: targetArtistId });
      return NextResponse.json({ success: true, message: 'Your messages cleared' });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error("Error clearing messages:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
