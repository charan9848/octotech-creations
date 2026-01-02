import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

// GET all blog posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'published', 'draft', or null for all
    const limit = parseInt(searchParams.get('limit')) || 0;
    const page = parseInt(searchParams.get('page')) || 1;
    const tag = searchParams.get('tag');

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Build query
    const query = {};
    
    // For public requests, only show published posts
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin';
    
    if (!isAdmin) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Get total count for pagination
    const total = await db.collection("blogPosts").countDocuments(query);

    // Fetch posts
    let cursor = db.collection("blogPosts")
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 });

    if (limit > 0) {
      const skip = (page - 1) * limit;
      cursor = cursor.skip(skip).limit(limit);
    }

    const posts = await cursor.toArray();

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit: limit || total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 1
      }
    });
  } catch (error) {
    console.error("Fetch blog posts error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST new blog post (admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, slug, content, excerpt, coverImage, tags, status } = data;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Check if slug already exists
    const existing = await db.collection("blogPosts").findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 });
    }

    const newPost = {
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      content,
      excerpt: excerpt || content.substring(0, 160) + '...',
      coverImage: coverImage || '',
      tags: tags || [],
      status: status || 'draft',
      author: session.user.role === 'admin' ? 'Octotech Creations' : (session.user.name || 'Unknown'),
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: status === 'published' ? new Date() : null
    };

    const result = await db.collection("blogPosts").insertOne(newPost);

    // Send email to all subscribers if post is published
    if (status === 'published') {
      try {
        const subscribers = await db.collection("blogSubscribers").find({}).toArray();
        
        if (subscribers.length > 0) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const postUrl = `${process.env.NEXTAUTH_URL || 'https://octotechcreations.com'}/blog/${newPost.slug}`;
          
          // Send emails in batches to avoid rate limits
          for (const subscriber of subscribers) {
            try {
              await transporter.sendMail({
                from: `"Octotech Creations" <${process.env.EMAIL_USER}>`,
                to: subscriber.email,
                subject: `📝 New Blog Post: ${title}`,
                html: `
                  <div style="font-family: Arial, sans-serif; background: #0B1113; padding: 40px 20px;">
                    <div style="max-width: 600px; margin: auto; background: #13171a; border-radius: 12px; overflow: hidden;">
                      ${coverImage ? `<img src="${coverImage}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover;" />` : ''}
                      <div style="padding: 30px;">
                        <h1 style="color: #00ACC1; margin: 0 0 16px 0; font-size: 24px;">${title}</h1>
                        <p style="color: #aeb4b4; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                          ${excerpt || content.substring(0, 200) + '...'}
                        </p>
                        <a href="${postUrl}" style="display: inline-block; background: #00ACC1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                          Read Full Article
                        </a>
                      </div>
                      <div style="padding: 20px 30px; background: #0B1113; text-align: center;">
                        <p style="color: #666; font-size: 12px; margin: 0;">
                          You're receiving this because you commented on our blog.<br>
                          <a href="${process.env.NEXTAUTH_URL || 'https://octotechcreations.com'}" style="color: #00ACC1;">Octotech Creations</a>
                        </p>
                      </div>
                    </div>
                  </div>
                `,
              });
            } catch (emailError) {
              console.error(`Failed to send email to ${subscriber.email}:`, emailError.message);
            }
          }
          console.log(`Blog notification sent to ${subscribers.length} subscribers`);
        }
      } catch (emailError) {
        console.error("Failed to send blog notifications:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ 
      message: 'Blog post created successfully',
      postId: result.insertedId,
      slug: newPost.slug
    });
  } catch (error) {
    console.error("Create blog post error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
