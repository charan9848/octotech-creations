import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

// POST - Add a like to a blog post
export async function POST(request, { params }) {
  try {
    const { slug } = await params;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Increment like count
    const result = await db.collection("blogPosts").updateOne(
      { slug },
      { $inc: { likes: 1 } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get updated like count
    const post = await db.collection("blogPosts").findOne({ slug }, { projection: { likes: 1 } });

    return NextResponse.json({ likes: post.likes || 1 });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
