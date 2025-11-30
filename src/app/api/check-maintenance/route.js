import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const settings = await db.collection("settings").findOne({ key: "global_settings" });
    
    return NextResponse.json({ 
      maintenanceMode: settings?.maintenanceMode || false 
    });
  } catch (error) {
    return NextResponse.json({ maintenanceMode: false });
  }
}
