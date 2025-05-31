import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewIndex } = await request.json();
    
    if (reviewIndex === undefined || reviewIndex === null) {
      return Response.json({ error: "Review index is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get current portfolio data
    const portfolio = await db.collection("portfolios").findOne({ 
      artistId: session.user.artistid 
    });
    
    if (!portfolio || !portfolio.ratings || !portfolio.ratings.reviews) {
      return Response.json({ error: "No reviews found" }, { status: 404 });
    }    const reviews = portfolio.ratings.reviews;
    
    if (reviewIndex < 0 || reviewIndex >= reviews.length) {
      return Response.json({ error: "Invalid review index" }, { status: 400 });
    }

    // Store review data before deletion for feedback collection cleanup
    const reviewToDelete = reviews[reviewIndex];

    // Remove the review at the specified index
    reviews.splice(reviewIndex, 1);

    // Recalculate ratings after deletion
    let updatedRatings;
    if (reviews.length > 0) {
      // Calculate new average rating
      const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRatings / reviews.length;

      // Calculate rating breakdown
      const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
        const count = reviews.filter(r => r.rating === stars).length;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { stars, count, percentage };
      });

      updatedRatings = {
        currentRating: averageRating,
        totalReviews: reviews.length,
        ratingBreakdown,
        reviews: reviews,
        lastUpdated: new Date()
      };
    } else {
      // No reviews left
      updatedRatings = {
        currentRating: 0,
        totalReviews: 0,
        ratingBreakdown: [5, 4, 3, 2, 1].map(stars => ({
          stars,
          count: 0,
          percentage: 0
        })),
        reviews: [],
        lastUpdated: new Date()
      };
    }

    // Update portfolio with new ratings
    await db.collection("portfolios").updateOne(
      { artistId: session.user.artistid },
      { 
        $set: { 
          ratings: updatedRatings,
          updatedAt: new Date()
        }
      }
    );

    // Also delete from feedbacks collection
    try {
      await db.collection("feedbacks").deleteOne({
        artistId: session.user.artistid,
        clientName: reviewToDelete.reviewer,
        rating: reviewToDelete.rating,
        review: reviewToDelete.comment
      });
    } catch (feedbackError) {
      console.error('Error deleting from feedbacks collection:', feedbackError);
      // Continue even if feedback deletion fails
    }

    return Response.json({ 
      message: "Review deleted successfully!",
      success: true,
      updatedRatings: updatedRatings
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return Response.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
