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
    const { version, notes } = await request.json();

    if (!version || !version.trim()) {
      return NextResponse.json({ error: 'Version number is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Get all artist emails
    const artists = await db.collection("artists")
      .find({}, { projection: { email: 1, username: 1 } })
      .toArray();

    const artistEmails = artists.filter(a => a.email).map(a => a.email);

    if (artistEmails.length === 0) {
      return NextResponse.json({ error: 'No artists found to notify' }, { status: 400 });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      },
    });

    // Format release notes as HTML list if provided
    const releaseNotesHtml = notes && notes.trim() 
      ? `
        <h3 style="color: #32b4de; margin-top: 20px;">What's New:</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
          ${notes.split('\n').map(line => line.trim()).filter(line => line).map(line => `<p style="margin: 5px 0;">• ${line}</p>`).join('')}
        </div>
      `
      : '';

    // Send email
    await transporter.sendMail({
      from: `"Octotech Creations" <${process.env.EMAIL_USER}>`,
      bcc: artistEmails,
      subject: `🚀 Octotech Creations ${version} - New Update Released!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #1a2027 0%, #2d3748 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #32b4de; margin: 0;">🚀 New Update Released!</h1>
            <p style="color: #fff; margin-top: 10px; font-size: 18px;">Version ${version}</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0;">
            <p style="font-size: 16px;">Hello Artist,</p>
            
            <p>We're excited to announce that a new version of <strong>Octotech Creations</strong> has been deployed!</p>
            
            ${releaseNotesHtml}
            
            <p style="margin-top: 20px;">To experience the latest features, please refresh your browser or clear your cache if you encounter any issues.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://octotechcreations.com/artist-login" 
                 style="display: inline-block; background-color: #32b4de; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you have any questions or encounter any issues with the new update, feel free to reach out through the chat feature in your dashboard.
            </p>
          </div>
          
          <div style="background-color: #1a2027; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #888; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} Octotech Creations. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    // Update the current version in settings
    await db.collection("settings").updateOne(
      { key: "global_settings" },
      { $set: { currentVersion: version, lastDeployedAt: new Date() } },
      { upsert: true }
    );

    // Log the deployment notification
    await db.collection("deployment_logs").insertOne({
      version: version,
      notes: notes || '',
      sentTo: artistEmails.length,
      sentAt: new Date(),
      sentBy: session.user.email || session.user.username
    });

    return NextResponse.json({ 
      success: true, 
      sentTo: artistEmails.length,
      message: `Notification sent to ${artistEmails.length} artists`
    });

  } catch (error) {
    console.error("Deployment notification error:", error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
