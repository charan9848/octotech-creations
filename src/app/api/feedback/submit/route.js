import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";
import { createNotification } from "@/lib/db-notifications";

export async function POST(request) {
  try {
    const data = await request.json();
    const { artistId, projectTitle, rating, review, clientName, clientEmail } = data;

    // Validate required fields
    if (!artistId || !rating || !clientName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Create feedback entry
    const feedbackData = {
      artistId,
      projectTitle: projectTitle || "General Feedback",
      rating: parseInt(rating),
      review: review || "",
      clientName,
      clientEmail: clientEmail || "",
      read: false,
      submittedAt: new Date()
    };

    // Insert feedback into feedbacks collection
    await db.collection("feedbacks").insertOne(feedbackData);

    // Update artist's portfolio ratings
    const portfolio = await db.collection("portfolios").findOne({ artistId });
    
    let updatedRatings;
    if (portfolio && portfolio.ratings) {
      // Update existing ratings
      const currentRatings = portfolio.ratings;
      const currentReviews = currentRatings.reviews || [];
      const newReviews = [...currentReviews, {
        reviewer: clientName,
        rating: parseInt(rating),
        comment: review || "",
        date: new Date().toISOString(),
        projectTitle: projectTitle || "General Feedback"
      }];

      // Calculate new average rating
      const totalRatings = newReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRatings / newReviews.length;

      // Calculate rating breakdown
      const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
        const count = newReviews.filter(r => r.rating === stars).length;
        const percentage = newReviews.length > 0 ? (count / newReviews.length) * 100 : 0;
        return { stars, count, percentage };
      });

      updatedRatings = {
        currentRating: averageRating,
        totalReviews: newReviews.length,
        ratingBreakdown,
        reviews: newReviews,
        lastUpdated: new Date()
      };
    } else {
      // Create new ratings structure
      updatedRatings = {
        currentRating: parseInt(rating),
        totalReviews: 1,
        ratingBreakdown: [5, 4, 3, 2, 1].map(stars => ({
          stars,
          count: stars === parseInt(rating) ? 1 : 0,
          percentage: stars === parseInt(rating) ? 100 : 0
        })),
        reviews: [{
          reviewer: clientName,
          rating: parseInt(rating),
          comment: review || "",
          date: new Date().toISOString(),
          projectTitle: projectTitle || "General Feedback"
        }],
        lastUpdated: new Date()
      };
    }    // Update portfolio with new ratings
    await db.collection("portfolios").updateOne(
      { artistId },
      { 
        $set: { 
          ratings: updatedRatings,
          updatedAt: new Date()
        },
        $setOnInsert: { 
          artistId,
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );

    // Notify Admin
    await createNotification({
      type: 'success',
      message: `New ${rating}-Star Feedback for artist ${artistId} from ${clientName}`,
      recipient: 'admin',
      relatedId: artistId,
      link: `/admin/dashboard/feedback`
    });

    // Send email notification to artist about new feedback
    try {
      console.log('Attempting to send email notification...');
      const artistData = await db.collection("artists").findOne({ artistid: artistId });
        if (artistData && artistData.email) {
        console.log('Artist found:', artistData.email);
        
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // Test transporter configuration
        await transporter.verify();
        console.log('Email transporter verified successfully');

        const stars = "⭐".repeat(parseInt(rating));
        
        const artistMailOptions = {
          from: process.env.EMAIL_USER,
          to: artistData.email,
          subject: `New ${rating}-Star Review Received! 🎉`,
          html: `
            <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 30px;">
              <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="color: #00a1e0; margin-bottom: 8px;">🎉 New Review Received!</h1>
                  <div style="font-size: 24px; margin-bottom: 8px;">${stars}</div>
                  <div style="width: 60px; height: 4px; background: #00a1e0; margin: 0 auto;"></div>
                </div>
                
                <div style="background: #f9f9f9; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                  <h2 style="color: #333; margin-bottom: 16px;">Great news, ${artistData.username}!</h2>
                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    You've received a new ${rating}-star review from ${clientName}. Keep up the excellent work!
                  </p>
                  
                  <div style="background: #fff; border-radius: 6px; padding: 20px; border-left: 4px solid #4caf50;">
                    <table style="width: 100%; font-size: 15px;">
                      <tr>
                        <td style="color: #555; font-weight: bold; padding: 8px 0; width: 25%;">Client:</td>
                        <td style="color: #222; padding: 8px 0;">${clientName}</td>
                      </tr>
                      <tr>
                        <td style="color: #555; font-weight: bold; padding: 8px 0;">Project:</td>
                        <td style="color: #222; padding: 8px 0;">${projectTitle || "General Feedback"}</td>
                      </tr>
                      <tr>
                        <td style="color: #555; font-weight: bold; padding: 8px 0;">Rating:</td>
                        <td style="color: #4caf50; padding: 8px 0; font-weight: bold;">${rating}/5 stars ${stars}</td>
                      </tr>
                      ${review ? `
                      <tr>
                        <td style="color: #555; font-weight: bold; padding: 8px 0; vertical-align: top;">Review:</td>
                        <td style="color: #222; padding: 8px 0; line-height: 1.5; font-style: italic;">"${review}"</td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                </div>

                <div style="background: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
                  <h3 style="color: #1976d2; margin-bottom: 12px;">📈 Your Rating Impact</h3>
                  <p style="color: #1976d2; margin-bottom: 16px;">
                    Your updated rating is now <strong>${updatedRatings.currentRating.toFixed(1)}/5.0</strong> based on <strong>${updatedRatings.totalReviews}</strong> review${updatedRatings.totalReviews > 1 ? 's' : ''}!
                  </p>
                  <a href="${process.env.NEXTAUTH_URL || 'https://www.octotechcreations.com'}/artist-dashboard/portfolio/ratings" 
                     style="display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    View Your Ratings Dashboard
                  </a>
                </div>

                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #999; font-size: 14px; margin-bottom: 8px;">
                    Keep delivering excellent work to maintain your high ratings!
                  </p>
                  <p style="color: #00a1e0; font-weight: bold; margin: 0;">
                    Octotech Creations Team
                  </p>
                </div>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(artistMailOptions);
      }
    } catch (emailError) {
      console.error('Error sending feedback notification email:', emailError);
      // Don't fail the feedback submission if email fails
    }

    return Response.json({ 
      message: "Feedback submitted successfully!",
      success: true 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return Response.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
