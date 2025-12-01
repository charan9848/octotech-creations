import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Fetch all artists
    const artists = await db.collection("artists").find({}, { projection: { email: 1 } }).toArray();
    const artistEmails = artists.map(a => a.email).filter(Boolean);

    if (artistEmails.length === 0) {
      return NextResponse.json({ message: 'No artists found to email' });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      bcc: artistEmails, // Use BCC to protect privacy
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1a2027; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #32b4de; margin: 0;">OctoTech Creations</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h3 style="margin-top: 0;">${subject}</h3>
            <div style="line-height: 1.6;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">
              You are receiving this email as a registered artist at OctoTech Creations.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, count: artistEmails.length });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
