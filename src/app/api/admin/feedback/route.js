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
    const feedback = await db.collection("feedbacks").find({}).sort({ createdAt: -1 }).toArray();
    
    const feedbackWithDates = feedback.map(item => ({
      ...item,
      createdAt: item.createdAt || item._id.getTimestamp()
    }));

    return NextResponse.json(feedbackWithDates);
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

    // Handle feedback details update
    if (body.clientName) updateData.clientName = body.clientName;
    if (body.rating) updateData.rating = body.rating;
    if (body.review) updateData.review = body.review;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' });
    }

    // Add updated timestamp if we are updating details
    if (body.clientName || body.rating || body.review) {
      updateData.updatedAt = new Date();
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const result = await db.collection("feedbacks").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 1) {
      return NextResponse.json({ message: 'Feedback updated successfully' });
    } else {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
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
    
    const result = await db.collection("feedbacks").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Feedback deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    if (!data.clientName || !data.rating || !data.review) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const newFeedback = {
      clientName: data.clientName,
      rating: Number(data.rating),
      review: data.review,
      artistId: data.artistId || 'Admin', // Default to Admin if not provided
      createdAt: new Date(),
      submittedAt: new Date() // For compatibility with frontend display
    };

    const result = await db.collection("feedbacks").insertOne(newFeedback);

    if (result.acknowledged) {
      return NextResponse.json({ message: 'Feedback added successfully', id: result.insertedId });
    } else {
      return NextResponse.json({ error: 'Failed to add feedback' }, { status: 500 });
    }
  } catch (error) {
    console.error("Add error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
