import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const settings = await db.collection("settings").findOne({ key: "global_settings" });
    
    // Default settings if not found
    const defaultSettings = {
      maxArtists: 4
    };

    return NextResponse.json(settings || defaultSettings);
  } catch (error) {
    console.error("Settings fetch error:", error);
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
    const { maxArtists } = body;

    if (maxArtists === undefined || maxArtists === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    await db.collection("settings").updateOne(
      { key: "global_settings" },
      { $set: { key: "global_settings", maxArtists: parseInt(maxArtists) } },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
