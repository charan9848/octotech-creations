import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const artistsCount = await db.collection("artists").countDocuments();
    const feedbackCount = await db.collection("feedbacks").countDocuments();
    const contactCount = await db.collection("contactus").countDocuments();
    
    // Get feedback rating distribution
    const feedbackStats = await db.collection("feedbacks").aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    feedbackStats.forEach(stat => {
      if (stat._id >= 1 && stat._id <= 5) {
        ratingDistribution[stat._id] = stat.count;
      }
    });

    // Get recent activity (e.g., last 5 registered artists)
    const recentArtists = await db.collection("artists")
      .find({}, { projection: { password: 0 } })
      .sort({ _id: -1 })
      .limit(5)
      .toArray();

    // Get recent messages
    const recentMessages = await db.collection("contactus")
      .find({})
      .sort({ _id: -1 })
      .limit(5)
      .toArray();

    // Get monthly registration stats (last 6 months)
    // Note: Assuming _id contains timestamp if createdAt is missing, but for simplicity in aggregation
    // we will try to use a simple projection if createdAt exists, or just mock it if data is sparse.
    // For a real app, ensure 'createdAt' field exists. 
    // Here we'll just return a simple count for now or try to aggregate if possible.
    
    // Let's try to get all artists created dates to build the chart on the client side 
    // (better for small datasets than complex mongo aggregation if schema is uncertain)
    const allArtistsDates = await db.collection("artists")
      .find({}, { projection: { _id: 1, createdAt: 1 } })
      .toArray();

    // Get visitor stats
    const visitorStats = await db.collection("visitor_stats").find({}).toArray();
    const totalVisitors = visitorStats.reduce((acc, curr) => acc + curr.count, 0);

    // Get global settings
    const settings = await db.collection("settings").findOne({ key: "global_settings" }) || { maxArtists: 4, maintenanceMode: false, allowRegistrations: true };

    // --- Calculate Total Revenue & Collect Projects ---
    // First, get a map of artistId -> username
    const allArtists = await db.collection("artists").find({}, { projection: { artistid: 1, username: 1 } }).toArray();
    const artistMap = {};
    allArtists.forEach(a => { artistMap[a.artistid] = a.username; });

    const allPortfolios = await db.collection("portfolios").find({}, { projection: { artistId: 1, projects: 1 } }).toArray();
    let totalRevenue = 0;
    let totalProjects = 0;
    let completedProjects = 0;
    let allProjectsList = [];

    allPortfolios.forEach(portfolio => {
      if (portfolio.projects && Array.isArray(portfolio.projects)) {
        portfolio.projects.forEach((project, index) => {
          // Sum up budget (ensure it's a number)
          const amount = parseFloat(project.budget) || 0;
          totalRevenue += amount;
          totalProjects++;
          if (project.status === 'Completed') {
            completedProjects++;
          }
          
          // Add to list
          allProjectsList.push({
            ...project, // Include all project fields (description, clientEmail, etc.)
            artistId: portfolio.artistId,
            projectIndex: index, // Store original index for editing/deleting
            budget: amount,
            artistName: artistMap[portfolio.artistId] || 'Unknown Artist',
          });
        });
      }
    });

    // Sort projects by startDate (most recent first) and take top 10
    const recentProjectsList = allProjectsList.sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
      const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
      return dateB - dateA;
    }).slice(0, 10);
    // ---------------------------------------------

    return NextResponse.json({
      stats: {
        artists: artistsCount,
        feedback: feedbackCount,
        contacts: contactCount,
        visitors: totalVisitors,
        revenue: totalRevenue,
        projects: totalProjects,
        completedProjects: completedProjects
      },
      recentProjectsList,
      allArtists, // Send list of artists for "Add Project" dropdown
      ratingDistribution,
      recentArtists,
      recentMessages,
      allArtistsDates,
      visitorStats, // Send raw daily stats for charting
      settings
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
