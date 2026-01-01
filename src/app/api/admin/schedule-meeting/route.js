import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";
import { google } from 'googleapis';

// Google Calendar API setup
function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  return oauth2Client;
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { artistId, artistName, artistEmail, date, time, duration, subject, message } = await request.json();

    // Validate required fields
    if (!artistEmail || !date || !time) {
      return NextResponse.json({ error: 'Artist email, date, and time are required' }, { status: 400 });
    }

    // Create start and end times
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (duration || 30) * 60000);

    let meetLink = '';
    let eventId = '';
    let calendarError = null;

    // Try to create Google Calendar event with Meet link
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
      try {
        const oauth2Client = getOAuth2Client();
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
          summary: subject || `Meeting with ${artistName}`,
          description: message || 'Meeting scheduled by Octotech Creations Admin',
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'Asia/Kolkata'
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'Asia/Kolkata'
          },
          attendees: [
            { email: artistEmail }
          ],
          conferenceData: {
            createRequest: {
              requestId: `octotech-meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          conferenceDataVersion: 1,
          sendUpdates: 'none' // We send our own email
        });

        meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri || '';
        eventId = response.data.id;
        console.log('Google Meet created:', meetLink);
      } catch (err) {
        calendarError = err.message;
        console.error('Google Calendar error:', err.message);
      }
    }

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send email to artist
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email template with better mobile/dark mode support
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Meeting Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5 !important; -webkit-text-size-adjust: 100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00a1e0, #00d9ff); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 24px; font-weight: 700;">OCTOTECH CREATIONS</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 14px;">Meeting Invitation</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px; background-color: #ffffff;">
              <p style="color: #333333 !important; font-family: Arial, sans-serif; font-size: 16px; margin: 0 0 20px 0;">
                Hello <strong style="color: #00a1e0 !important;">${artistName || 'there'}</strong>,
              </p>
              
              <p style="color: #666666 !important; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">
                You have been invited to a meeting. Please find the details below:
              </p>
              
              <!-- Meeting Details Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f9ff; border: 1px solid #00a1e0; border-radius: 8px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <span style="color: #666666 !important; font-family: Arial, sans-serif; font-size: 13px;">📋 Subject</span>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
                          <span style="color: #00a1e0 !important; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600;">${subject || 'Meeting'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <span style="color: #666666 !important; font-family: Arial, sans-serif; font-size: 13px;">📅 Date</span>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
                          <span style="color: #333333 !important; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600;">${formattedDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <span style="color: #666666 !important; font-family: Arial, sans-serif; font-size: 13px;">🕐 Time</span>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
                          <span style="color: #333333 !important; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600;">${time} IST</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #666666 !important; font-family: Arial, sans-serif; font-size: 13px;">⏱️ Duration</span>
                        </td>
                        <td style="padding: 10px 0; text-align: right;">
                          <span style="color: #333333 !important; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600;">${duration || 30} minutes</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${message ? `
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; border-radius: 8px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #888888 !important; font-family: Arial, sans-serif; font-size: 12px; margin: 0 0 5px 0;">Message from Admin:</p>
                    <p style="color: #333333 !important; font-family: Arial, sans-serif; font-size: 14px; margin: 0; line-height: 1.6;">${message}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Join Button -->
              ${meetLink ? `
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${meetLink}" style="display: inline-block; background: linear-gradient(135deg, #00a1e0, #00d9ff); color: #ffffff !important; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-family: Arial, sans-serif; font-weight: 700; font-size: 16px;">
                      🎥 Join Google Meet
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="color: #888888 !important; font-family: Arial, sans-serif; font-size: 12px; margin: 0;">
                      Or copy this link: <a href="${meetLink}" style="color: #00a1e0 !important;">${meetLink}</a>
                    </p>
                  </td>
                </tr>
              </table>
              ` : `
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff3cd; border-radius: 8px;">
                <tr>
                  <td style="padding: 15px; text-align: center;">
                    <p style="color: #856404 !important; font-family: Arial, sans-serif; font-size: 14px; margin: 0;">
                      📧 Google Meet link will be shared separately before the meeting.
                    </p>
                  </td>
                </tr>
              </table>
              `}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center;">
              <p style="color: #888888 !important; font-family: Arial, sans-serif; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Octotech Creations. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"Octotech Creations" <${process.env.EMAIL_USER}>`,
      to: artistEmail,
      subject: `📅 Meeting Invitation: ${subject || 'Meeting with Octotech Creations'}`,
      html: emailHtml
    });

    // Save meeting to database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    await db.collection("meetings").insertOne({
      artistId,
      artistName,
      artistEmail,
      date,
      time,
      duration: duration || 30,
      subject: subject || 'Meeting',
      message,
      meetLink: meetLink || null,
      eventId: eventId || null,
      createdBy: session.user.email,
      createdAt: new Date(),
      status: 'scheduled',
      calendarError: calendarError || null
    });

    return NextResponse.json({
      success: true,
      message: 'Meeting scheduled and email sent successfully',
      meetLink: meetLink || null,
      eventId: eventId || null,
      calendarError: calendarError || null
    });

  } catch (error) {
    console.error('Error scheduling meeting:', error);
    return NextResponse.json({ 
      error: 'Failed to schedule meeting', 
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Fetch all scheduled meetings
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const meetings = await db.collection("meetings")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

// DELETE - Delete a meeting
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Get the meeting first to check if it has a Google Calendar event
    const { ObjectId } = await import('mongodb');
    const meeting = await db.collection("meetings").findOne({ _id: new ObjectId(id) });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Try to delete from Google Calendar if event exists
    if (meeting.eventId && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
      try {
        const oauth2Client = getOAuth2Client();
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: meeting.eventId,
          sendUpdates: 'all' // Notify attendees about cancellation
        });
        console.log('Google Calendar event deleted:', meeting.eventId);
      } catch (calendarError) {
        console.error('Error deleting Google Calendar event:', calendarError.message);
        // Continue with database deletion even if calendar deletion fails
      }
    }

    // Delete from database
    const result = await db.collection("meetings").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Meeting deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json({ 
      error: 'Failed to delete meeting', 
      details: error.message 
    }, { status: 500 });
  }
}
