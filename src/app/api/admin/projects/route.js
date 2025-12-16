import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper to check admin access
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return false;
  }
  return true;
}

export async function POST(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { artistId, project } = await request.json();
    
    if (!artistId || !project) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Add project to the artist's portfolio
    // If portfolio doesn't exist, create it (upsert)
    const result = await db.collection("portfolios").updateOne(
      { artistId: artistId },
      { 
        $push: { projects: project },
        $setOnInsert: { createdAt: new Date() },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Project added successfully' });
  } catch (error) {
    console.error("Error adding project:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { artistId, projectIndex, project } = await request.json();

    if (!artistId || projectIndex === undefined || !project) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Update specific project by index
    // Note: Using array index for update is risky if array changes concurrently, 
    // but given the current schema structure, it's the only way without unique IDs.
    // A safer way would be to match by title/clientEmail if unique, but index is direct.
    
    const updateField = `projects.${projectIndex}`;
    
    const result = await db.collection("portfolios").updateOne(
      { artistId: artistId },
      { 
        $set: { 
          [updateField]: project,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Project not found or not modified' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { artistId, projectIndex } = await request.json();

    if (!artistId || projectIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // To delete by index, we first need to unset it, then pull nulls? 
    // Or use $pull if we can identify it uniquely.
    // Since we don't have IDs, and $pull removes ALL matching instances, 
    // using the index is tricky in MongoDB.
    // Best approach: Read, Splice, Write.
    
    const portfolio = await db.collection("portfolios").findOne({ artistId: artistId });
    
    if (!portfolio || !portfolio.projects || !portfolio.projects[projectIndex]) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const newProjects = [...portfolio.projects];
    newProjects.splice(projectIndex, 1);

    const result = await db.collection("portfolios").updateOne(
      { artistId: artistId },
      { 
        $set: { 
          projects: newProjects,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
