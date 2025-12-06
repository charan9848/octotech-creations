import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // 1. Fetch all artists
    const artists = await db.collection("artists").find({}).toArray();

    // 2. Fetch all portfolios
    const portfolios = await db.collection("portfolios").find({}).toArray();
    const portfolioMap = new Map(portfolios.map(p => [p.artistId, p]));

    // 3. Identify artists with incomplete portfolios
    const incompleteArtists = artists.map(artist => {
      const portfolio = portfolioMap.get(artist.artistid);
      let percentage = 0;
      
      if (portfolio) {
        // Basic Details (20%)
        if (portfolio.basicDetails && portfolio.basicDetails.bio) percentage += 20;
        // Artworks (20%)
        if (portfolio.artworks && portfolio.artworks.length > 0) percentage += 20;
        // Projects (20%)
        if (portfolio.projects && portfolio.projects.length > 0) percentage += 20;
        // Experience (20%)
        if (portfolio.experience && portfolio.experience.length > 0) percentage += 20;
        // Specialization (20%)
        if (portfolio.specialization && portfolio.specialization.primarySkills && portfolio.specialization.primarySkills.length > 0) percentage += 20;
      }

      return {
        ...artist,
        completionPercentage: percentage,
        phone: artist.phone || portfolio?.basicDetails?.phone || null
      };
    }).filter(a => a.completionPercentage < 100);

    return NextResponse.json(incompleteArtists);

  } catch (error) {
    console.error("Error fetching missing portfolios:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Parse request body for optional target
    const body = await request.json().catch(() => ({}));
    const { targetId } = body;

    // 1. Fetch all artists
    const artists = await db.collection("artists").find({}).toArray();

    // 2. Fetch all portfolios
    const portfolios = await db.collection("portfolios").find({}).toArray();
    const portfolioMap = new Map(portfolios.map(p => [p.artistId, p]));

    // 3. Identify artists with incomplete portfolios (< 100%)
    const incompleteArtists = artists.map(artist => {
      const portfolio = portfolioMap.get(artist.artistid);
      let percentage = 0;
      
      if (portfolio) {
        if (portfolio.basicDetails && portfolio.basicDetails.bio) percentage += 20;
        if (portfolio.artworks && portfolio.artworks.length > 0) percentage += 20;
        if (portfolio.projects && portfolio.projects.length > 0) percentage += 20;
        if (portfolio.experience && portfolio.experience.length > 0) percentage += 20;
        if (portfolio.specialization && portfolio.specialization.primarySkills && portfolio.specialization.primarySkills.length > 0) percentage += 20;
      }

      return {
        ...artist,
        completionPercentage: percentage,
        phone: artist.phone || portfolio?.basicDetails?.phone || null
      };
    }).filter(a => a.completionPercentage < 100);

    // Filter for specific target if requested
    let targets = incompleteArtists;
    if (targetId) {
      targets = incompleteArtists.filter(a => a._id.toString() === targetId);
      if (targets.length === 0) {
        return NextResponse.json({ message: "Artist not found or portfolio is already complete." }, { status: 404 });
      }
    }

    if (targets.length === 0) {
      return NextResponse.json({ message: "All artists have completed their portfolios." });
    }

    // 4. Configure Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 5. Send Emails and SMS
    const notificationResults = await Promise.all(targets.map(async (artist) => {
      const results = { email: false, whatsapp: false, errors: [] };

      // Email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: artist.email,
        subject: "Action Required: Complete Your Portfolio Profile",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Hello ${artist.username || 'Artist'},</h2>
            <p>We noticed that your portfolio on <strong>Octotech Creations</strong> is incomplete (${artist.completionPercentage}%).</p>
            <p>Your portfolio is your showcase to the world. Please log in to your dashboard and upload your details, artworks, and showreel to get listed on our main page.</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://octotechcreations.com'}/artist-login" 
                 style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                 Login to Dashboard
              </a>
            </p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <br/>
            <p>Best regards,<br/>The Octotech Creations Team</p>
          </div>
        `
      };
      
      try {
        await transporter.sendMail(mailOptions);
        results.email = true;
      } catch (err) {
        console.error(`Email failed for ${artist.email}:`, err);
        results.errors.push(`Email failed: ${err.message}`);
      }

      // WhatsApp
      if (artist.phone) {
        // Format phone number if needed (e.g., add country code if missing)
        let phone = artist.phone.replace(/\D/g, ''); // Remove non-digits
        if (phone.length === 10) {
             phone = `91${phone}`; // Default to India (+91)
        }
        
        // Send WhatsApp Template Message
        // Template: portfolio_reminder_v2
        // Variable {{1}}: artist.username
        // Variable {{2}}: artist.completionPercentage
        const components = [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: artist.username || "Artist"
              },
              {
                type: "text",
                text: String(artist.completionPercentage)
              }
            ]
          }
        ];
        
        const waResult = await sendWhatsAppMessage(phone, 'portfolio_reminder_v2', components);
        if (waResult.success) {
          results.whatsapp = true;
        } else {
          console.error(`WhatsApp failed for ${phone}:`, waResult.error);
          // Check for specific "not in allowed list" error
          const errorMsg = waResult.error?.error?.message || "Unknown WhatsApp error";
          results.errors.push(`WhatsApp failed: ${errorMsg}`);
        }
      }

      return { artist: artist.username, ...results };
    }));

    // Check if any errors occurred
    const failures = notificationResults.filter(r => r.errors.length > 0);
    
    if (failures.length > 0) {
      // If we targeted a single user and it failed, return 400
      if (targets.length === 1) {
        return NextResponse.json({ 
          error: failures[0].errors.join(", "),
          details: failures[0]
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      message: `Notifications processed. Sent to ${targets.length} artist(s).`,
      details: notificationResults
    });

  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
