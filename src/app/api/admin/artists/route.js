import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ObjectId } from 'mongodb';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const artists = await db.collection("artists").find({}, { projection: { password: 0 } }).toArray();
    
    // Add createdAt from _id if missing
    const artistsWithDate = artists.map(artist => ({
      ...artist,
      createdAt: artist.createdAt || artist._id.getTimestamp()
    }));

    return NextResponse.json(artistsWithDate);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const result = await db.collection("artists").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Artist deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, username, email } = body;

    if (!id || !username || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection("artists").updateOne(
      { _id: new ObjectId(id) },
      { $set: { username, email } }
    );

    if (result.matchedCount === 1) {
      return NextResponse.json({ message: 'Artist updated successfully' });
    } else {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
