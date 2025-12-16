import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const settings = await db.collection("settings").findOne({ key: "global_settings" });
    
    // Default settings if not found
    const defaultSettings = {
      maxArtists: 4,
      chatAutoDeleteDays: 0
    };

    return NextResponse.json(settings || defaultSettings);
  } catch (error) {
    console.error("Settings fetch error:", error);
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
    // Extract known settings
    const { maxArtists, maintenanceMode, allowRegistrations, chatAutoDeleteDays } = body;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Handle Maintenance Mode Emails
    if (maintenanceMode !== undefined) {
      const currentSettings = await db.collection("settings").findOne({ key: "global_settings" });
      const wasOn = currentSettings?.maintenanceMode;

      // Case 1: Turning ON (and it was OFF)
      if (maintenanceMode === true && !wasOn) {
        const artists = await db.collection("artists").find({}, { projection: { email: 1 } }).toArray();
        const artistEmails = artists.map(a => a.email).filter(Boolean);

        if (artistEmails.length > 0) {
          try {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });

            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              bcc: artistEmails,
              subject: "Important: Octotech Creations Maintenance Update",
              html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2>System Maintenance Notice</h2>
                  <p>Hello,</p>
                  <p>This is to inform you that <strong>OctoTech Creations</strong> is currently undergoing scheduled maintenance.</p>
                  <p>During this time, the public website will be inaccessible. However, as a registered artist, you may still be able to access your dashboard if needed, but please expect potential interruptions.</p>
                  <p>We will notify you once the maintenance is complete.</p>
                  <p>Best regards,<br/>The Octotech Team</p>
                </div>
              `,
            });
            console.log(`Maintenance START email sent to ${artistEmails.length} artists.`);
          } catch (emailError) {
            console.error("Failed to send maintenance emails:", emailError);
          }
        }
      }

      // Case 2: Turning OFF (and it was ON)
      if (maintenanceMode === false && wasOn) {
        const artists = await db.collection("artists").find({}, { projection: { email: 1 } }).toArray();
        const artistEmails = artists.map(a => a.email).filter(Boolean);

        if (artistEmails.length > 0) {
          try {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });

            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              bcc: artistEmails,
              subject: "Update: Octotech Creations is Back Online",
              html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2>System Maintenance Complete</h2>
                  <p>Hello,</p>
                  <p>We are pleased to inform you that the scheduled maintenance for <strong>OctoTech Creations</strong> has been successfully completed.</p>
                  <p>The website is now fully operational and accessible to the public. You can resume your normal activities on your dashboard.</p>
                  <p>Thank you for your patience.</p>
                  <p>Best regards,<br/>The Octotech Team</p>
                </div>
              `,
            });
            console.log(`Maintenance END email sent to ${artistEmails.length} artists.`);
          } catch (emailError) {
            console.error("Failed to send maintenance completion emails:", emailError);
          }
        }
      }
    }

    const updateData = {
      key: "global_settings",
      updatedAt: new Date()
    };

    if (maxArtists !== undefined) updateData.maxArtists = parseInt(maxArtists);
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
    if (allowRegistrations !== undefined) updateData.allowRegistrations = allowRegistrations;
    if (chatAutoDeleteDays !== undefined) updateData.chatAutoDeleteDays = parseInt(chatAutoDeleteDays);

    // If chat auto-delete is enabled, delete old messages now
    if (chatAutoDeleteDays !== undefined && chatAutoDeleteDays > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - chatAutoDeleteDays);
      await db.collection("messages").deleteMany({
        createdAt: { $lt: cutoffDate }
      });
    }

    await db.collection("settings").updateOne(
      { key: "global_settings" },
      { $set: updateData },
      { upsert: true }
    );

    return NextResponse.json({ message: "Settings updated" });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
