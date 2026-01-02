import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Fetch all content sections
    const content = await db.collection("siteContent").find({}).toArray();
    
    // Transform array to object for easier frontend consumption
    const contentMap = content.reduce((acc, item) => {
      acc[item.section] = item;
      return acc;
    }, {});

    return NextResponse.json(contentMap);
  } catch (error) {
    console.error("Fetch content error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { section, _id, ...contentData } = data; // Exclude _id from update

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const result = await db.collection("siteContent").updateOne(
      { section: section },
      { $set: { ...contentData, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Content updated successfully' });
  } catch (error) {
    console.error("Update content error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
