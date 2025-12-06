import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const services = await db.collection("services").find({}).sort({ order: 1 }).toArray();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const body = await request.json();
    
    // Get the highest order number to append to the end
    const lastService = await db.collection("services").find().sort({ order: -1 }).limit(1).toArray();
    const newOrder = lastService.length > 0 ? (lastService[0].order || 0) + 1 : 1;

    const newService = {
        ...body,
        order: body.order || newOrder,
        createdAt: new Date()
    };

    const result = await db.collection("services").insertOne(newService);
    return NextResponse.json({ ...newService, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
