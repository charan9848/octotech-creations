import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const settings = await db.collection("settings").findOne({ key: "global_settings" });
    
    return NextResponse.json({ 
      version: settings?.currentVersion || '1.0',
      lastDeployedAt: settings?.lastDeployedAt || null
    });
  } catch (error) {
    console.error("Version fetch error:", error);
    return NextResponse.json({ version: '1.0' });
  }
}
