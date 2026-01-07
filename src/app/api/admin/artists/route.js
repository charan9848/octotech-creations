import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { createNotification } from '@/lib/db-notifications';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Join artists with portfolios to get the latest image
    const artists = await db.collection("artists").aggregate([
      {
        $lookup: {
          from: "portfolios",
          localField: "artistid", // linking field in artists
          foreignField: "artistId", // linking field in portfolios
          as: "portfolio"
        }
      },
      {
        $project: {
          // _id is included by default
          username: 1,
          email: 1,
          artistid: 1,
          role: 1,
          phone: 1,
          createdAt: 1,
          lastLogin: 1,
          image: 1,
          profileImage: 1,
          // Extract portfolio image directly in project stage
          portfolioImage: { $arrayElemAt: ["$portfolio.basicDetails.portfolioImage", 0] }
        }
      }
    ]).toArray();
    
    // Add createdAt from _id if missing
    const artistsWithDate = artists.map(artist => ({
      ...artist,
      createdAt: artist.createdAt || (artist._id && artist._id.getTimestamp())
    }));

    return NextResponse.json(artistsWithDate, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Admin artists fetch error:", error);
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
    
    const result = await db.collection("artists").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      // Create notification
      await createNotification({
        type: 'warning',
        message: `Artist deleted (ID: ${id})`,
        recipient: 'admin'
      });
      return NextResponse.json({ message: 'Artist deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
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
    const body = await request.json();
    const { id, username, email, role, password, phone } = body;

    if (!id || !username || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const updateData = { username, email };
    if (role) updateData.role = role;
    if (phone) updateData.phone = phone;
    
    // If password is provided, hash it and update
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const result = await db.collection("artists").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 1) {
      // Create notification
      await createNotification({
        type: 'info',
        message: `Artist ${username} updated`,
        recipient: 'admin',
        link: '/admin/dashboard/artists'
      });
      return NextResponse.json({ message: 'Artist updated successfully' });
    } else {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
