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

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');
    const body = await request.json();
    
    // ID can be in query params or body
    const id = queryId || body.id;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData = {};
    
    // Handle 'read' status update
    if (typeof body.read !== 'undefined') {
      updateData.read = body.read;
    }

    // Handle contact details update
    if (body.firstname) updateData.firstname = body.firstname;
    if (body.lastname) updateData.lastname = body.lastname;
    if (body.email) updateData.email = body.email;
    if (body.message) updateData.message = body.message;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' });
    }

    // Add updated timestamp if we are updating details
    if (body.firstname || body.lastname || body.email || body.message) {
      updateData.updatedAt = new Date();
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const result = await db.collection("contactus").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
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


