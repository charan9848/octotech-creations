import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get today's date string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Upsert: Increment count for today, or create if not exists
    await db.collection("visitor_stats").updateOne(
      { date: today },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
