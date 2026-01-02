import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Get comments for a blog post
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Check if admin for showing all comments including pending
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin';

    const query = { postSlug: slug };
    
    // Only show approved comments to public
    if (!isAdmin || !showAll) {
      query.status = 'approved';
    }

    const comments = await db.collection("blogComments")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Add a new comment
export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const data = await request.json();
    const { name, email, comment, honeypot } = data;

    // Spam protection - honeypot field should be empty
    if (honeypot) {
      return NextResponse.json({ message: 'Comment submitted' }); // Silent fail for bots
    }

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Comment length limit
    if (comment.length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 characters)' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Check if post exists
    const post = await db.collection("blogPosts").findOne({ slug });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check global settings for auto-approval
    const settings = await db.collection("settings").findOne({ key: "global_settings" });
    const autoApprove = settings?.autoApproveComments || false;

    // Create comment
    const newComment = {
      postSlug: slug,
      postTitle: post.title,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      comment: comment.trim(),
      status: autoApprove ? 'approved' : 'pending', // pending, approved, rejected
      createdAt: new Date()
    };

    await db.collection("blogComments").insertOne(newComment);

    // Also save email to subscribers collection (for newsletter)
    await db.collection("blogSubscribers").updateOne(
      { email: email.trim().toLowerCase() },
      { 
        $set: { 
          email: email.trim().toLowerCase(),
          name: name.trim(),
          updatedAt: new Date()
        },
        $setOnInsert: { 
          createdAt: new Date(),
          source: 'blog_comment'
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      message: 'Comment submitted for approval',
      comment: { ...newComment, email: undefined } // Don't return email
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
