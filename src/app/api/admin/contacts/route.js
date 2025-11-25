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
    const contacts = await db.collection("contactus").find({}).sort({ createdAt: -1 }).toArray();
    
    const contactsWithDates = contacts.map(item => ({
      ...item,
      createdAt: item.createdAt || item._id.getTimestamp()
    }));

    return NextResponse.json(contactsWithDates);
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
    
    const result = await db.collection("contactus").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Message deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const result = await db.collection("contactus").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          message: data.message,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 1) {
      return NextResponse.json({ message: 'Message updated successfully' });
    } else {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
