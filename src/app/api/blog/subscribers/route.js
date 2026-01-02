import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Get all blog subscribers (admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const subscribers = await db.collection("blogSubscribers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Fetch subscribers error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Remove a subscriber
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    await db.collection("blogSubscribers").deleteOne({ email: email.toLowerCase() });

    return NextResponse.json({ message: 'Subscriber removed' });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
