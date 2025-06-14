import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artistId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sortBy = searchParams.get('sortBy') || 'submittedAt'; // submittedAt, rating, clientName
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc
    const minRating = parseInt(searchParams.get('minRating')) || 1;
    const maxRating = parseInt(searchParams.get('maxRating')) || 5;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Build query filter
    let filter = {};
    
    // If artistId is provided, filter by specific artist
    // Otherwise, return all feedback (for admin purposes)
    if (artistId) {
      filter.artistId = artistId;
    }
    
    // Filter by rating range
    filter.rating = { $gte: minRating, $lte: maxRating };

    // Build sort object
    let sortObject = {};
    sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await db.collection("feedbacks").countDocuments(filter);
    
    // Get feedback data with pagination and sorting
    const feedbacks = await db.collection("feedbacks")
      .find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get artist information for each feedback
    const feedbacksWithArtistInfo = await Promise.all(
      feedbacks.map(async (feedback) => {
        const artist = await db.collection("artists").findOne(
          { artistid: feedback.artistId },
          { projection: { username: 1, artistid: 1, email: 1 } }
        );
        
        return {
          ...feedback,
          artistInfo: artist ? {
            username: artist.username,
            artistid: artist.artistid,
            email: artist.email
          } : null
        };
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get summary statistics
    const stats = await db.collection("feedbacks").aggregate([
      { $match: artistId ? { artistId } : {} },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingBreakdown: {
            $push: "$rating"
          }
        }
      }
    ]).toArray();

    let summary = {
      totalFeedbacks: 0,
      averageRating: 0,
      ratingBreakdown: {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      }
    };

    if (stats.length > 0) {
      const stat = stats[0];
      summary.totalFeedbacks = stat.totalFeedbacks;
      summary.averageRating = Math.round(stat.averageRating * 100) / 100;
      
      // Calculate rating breakdown
      stat.ratingBreakdown.forEach(rating => {
        summary.ratingBreakdown[rating]++;
      });
    }

    return Response.json({
      success: true,
      data: feedbacksWithArtistInfo,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit,
        skip
      },
      summary,
      filters: {
        artistId,
        minRating,
        maxRating,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return Response.json({ 
      error: "Failed to fetch feedback",
      details: error.message 
    }, { status: 500 });
  }
}
