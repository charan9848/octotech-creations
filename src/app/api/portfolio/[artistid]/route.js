import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

// GET - Fetch portfolio by artistid
export async function GET(request, context) {
  try {
    const { artistid } = await context.params;
    console.log("Looking for portfolio with artistid:", artistid);
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const portfolioCollection = db.collection('portfolios');
    
    const portfolio = await portfolioCollection.findOne({ artistId: artistid });
    
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    
    return NextResponse.json(portfolio);  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

// PUT - Update or create portfolio
export async function PUT(request, context) {
  try {
    const { artistid } = await context.params;
    const body = await request.json();
    console.log("Updating portfolio for artistid:", artistid);
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const portfolioCollection = db.collection('portfolios');
      const portfolioData = {
      artistId: artistid,
      basicDetails: {
        bio: body.bio || "",
        quotation: body.quotation || "",
        portfolioImage: body.portfolioImage || "",
        contactEmail: body.contactEmail || "",
        phone: body.phone || "",
        location: body.location || ""
      },
      experience: body.experience || [],
      specialization: body.specialization || [],
      artworks: body.artworks || [],
      awards: body.awards || [],
      ratings: body.ratings || { averageRating: 0, totalReviews: 0 },
      updatedAt: new Date()
    };

    // Check if portfolio exists
    const existingPortfolio = await portfolioCollection.findOne({ artistId: artistid });
      let result;
    if (existingPortfolio) {
      // Update existing portfolio
      result = await portfolioCollection.updateOne(
        { artistId: artistid },
        { $set: portfolioData }
      );
    } else {
      // Create new portfolio
      portfolioData.createdAt = new Date();
      result = await portfolioCollection.insertOne(portfolioData);
    }
    
    return NextResponse.json({ 
      message: existingPortfolio ? 'Portfolio updated successfully' : 'Portfolio created successfully',
      success: true 
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

// DELETE - Delete portfolio
export async function DELETE(request, context) {
  try {
    const { artistid } = await context.params;
    console.log("Deleting portfolio for artistid:", artistid);
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const portfolioCollection = db.collection('portfolios');
    
    const result = await portfolioCollection.deleteOne({ artistId: artistid });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}
