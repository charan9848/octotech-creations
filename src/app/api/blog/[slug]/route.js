import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ObjectId } from 'mongodb';
import nodemailer from "nodemailer";

// GET single blog post by slug
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const post = await db.collection("blogPosts").findOne({ slug });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if post is published or user is admin
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin';

    if (post.status !== 'published' && !isAdmin) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count for published posts
    if (post.status === 'published') {
      await db.collection("blogPosts").updateOne(
        { slug },
        { $inc: { views: 1 } }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Fetch blog post error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update blog post (admin only)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const data = await request.json();
    const { title, content, excerpt, coverImage, tags, status, newSlug, _id } = data;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const existingPost = await db.collection("blogPosts").findOne({ slug });
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If changing slug, check if new slug exists
    if (newSlug && newSlug !== slug) {
      const slugExists = await db.collection("blogPosts").findOne({ slug: newSlug });
      if (slugExists) {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 });
      }
    }

    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(coverImage !== undefined && { coverImage }),
      ...(tags && { tags }),
      ...(status && { status }),
      ...(newSlug && { slug: newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-') }),
      updatedAt: new Date()
    };

    // Set publishedAt when publishing for the first time
    if (status === 'published' && !existingPost.publishedAt) {
      updateData.publishedAt = new Date();
    }

    await db.collection("blogPosts").updateOne(
      { slug },
      { $set: updateData }
    );

    // Send email notifications if publishing for the first time
    if (status === 'published' && existingPost.status !== 'published') {
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

          const finalSlug = newSlug || slug;
          const postUrl = `${process.env.NEXTAUTH_URL || 'https://octotechcreations.com'}/blog/${finalSlug}`;
          const postTitle = title || existingPost.title;
          const postExcerpt = excerpt || existingPost.excerpt || content?.substring(0, 200) || existingPost.content?.substring(0, 200) || '';
          const postCoverImage = coverImage !== undefined ? coverImage : existingPost.coverImage;
          
          for (const subscriber of subscribers) {
            try {
              await transporter.sendMail({
                from: `"Octotech Creations" <${process.env.EMAIL_USER}>`,
                to: subscriber.email,
                subject: `📝 New Blog Post: ${postTitle}`,
                html: `
                  <div style="font-family: Arial, sans-serif; background: #0B1113; padding: 40px 20px;">
                    <div style="max-width: 600px; margin: auto; background: #13171a; border-radius: 12px; overflow: hidden;">
                      ${postCoverImage ? `<img src="${postCoverImage}" alt="${postTitle}" style="width: 100%; height: 200px; object-fit: cover;" />` : ''}
                      <div style="padding: 30px;">
                        <h1 style="color: #00ACC1; margin: 0 0 16px 0; font-size: 24px;">${postTitle}</h1>
                        <p style="color: #aeb4b4; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                          ${postExcerpt}...
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
      }
    }

    return NextResponse.json({ 
      message: 'Blog post updated successfully',
      slug: newSlug || slug
    });
  } catch (error) {
    console.error("Update blog post error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE blog post (admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection("blogPosts").deleteOne({ slug });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error("Delete blog post error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
