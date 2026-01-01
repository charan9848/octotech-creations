import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';
import clientPromise from "@/lib/mongodb";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all used media URLs from the database
async function getUsedMediaUrls() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const usedUrls = new Set();

  try {
    // Get profile images from artists collection
    const artists = await db.collection("artists").find({}).toArray();
    artists.forEach(artist => {
      if (artist.image && artist.image.includes('cloudinary')) {
        usedUrls.add(artist.image);
      }
    });

    // Get portfolio images and artwork media from portfolios collection
    const portfolios = await db.collection("portfolios").find({}).toArray();
    portfolios.forEach(portfolio => {
      // Basic details portfolio image
      if (portfolio.basicDetails?.portfolioImage && portfolio.basicDetails.portfolioImage.includes('cloudinary')) {
        usedUrls.add(portfolio.basicDetails.portfolioImage);
      }

      // Artwork media (images and videos)
      if (portfolio.artworks && Array.isArray(portfolio.artworks)) {
        portfolio.artworks.forEach(artwork => {
          if (artwork.image && artwork.image.includes('cloudinary')) {
            usedUrls.add(artwork.image);
          }
        });
      }
    });

    // Get service images/videos from services collection
    const services = await db.collection("services").find({}).toArray();
    services.forEach(service => {
      if (service.image && service.image.includes('cloudinary')) {
        usedUrls.add(service.image);
      }
    });

    // Get team member images from team collection (if exists)
    try {
      const team = await db.collection("team").find({}).toArray();
      team.forEach(member => {
        if (member.image && member.image.includes('cloudinary')) {
          usedUrls.add(member.image);
        }
      });
    } catch (e) {
      // Team collection might not exist
    }

    console.log(`Found ${usedUrls.size} used media URLs in database`);
    return usedUrls;
  } catch (error) {
    console.error("Error scanning database:", error);
    throw error;
  }
}

// Get all resources from Cloudinary
async function getAllCloudinaryResources() {
  const allResources = [];

  try {
    // Fetch image resources
    try {
      let nextCursor = null;
      do {
        const options = {
          resource_type: 'image',
          max_results: 100,
          type: 'upload'
        };

        if (nextCursor) {
          options.next_cursor = nextCursor;
        }

        const result = await cloudinary.api.resources(options);
        allResources.push(...result.resources);
        nextCursor = result.next_cursor;
      } while (nextCursor);
    } catch (imageError) {
      if (imageError.http_code !== 404) {
        console.warn("Could not fetch image resources:", imageError.message);
      }
    }

    // Fetch video resources
    try {
      let videoNextCursor = null;
      do {
        const videoOptions = {
          resource_type: 'video',
          max_results: 100,
          type: 'upload'
        };

        if (videoNextCursor) {
          videoOptions.next_cursor = videoNextCursor;
        }

        const videoResult = await cloudinary.api.resources(videoOptions);
        allResources.push(...videoResult.resources);
        videoNextCursor = videoResult.next_cursor;
      } while (videoNextCursor);
    } catch (videoError) {
      if (videoError.http_code !== 404) {
        console.warn("Could not fetch video resources:", videoError.message);
      }
    }

    // Fetch raw resources
    try {
      let rawNextCursor = null;
      do {
        const rawOptions = {
          resource_type: 'raw',
          max_results: 100,
          type: 'upload'
        };

        if (rawNextCursor) {
          rawOptions.next_cursor = rawNextCursor;
        }

        const rawResult = await cloudinary.api.resources(rawOptions);
        allResources.push(...rawResult.resources);
        rawNextCursor = rawResult.next_cursor;
      } while (rawNextCursor);
    } catch (rawError) {
      if (rawError.http_code !== 404) {
        console.warn("Could not fetch raw resources:", rawError.message);
      }
    }

    return allResources;
  } catch (error) {
    console.error("Error fetching Cloudinary resources:", error);
    throw error;
  }
}

// Find duplicate resources based on file hash/etag
function findDuplicatesByHash(resources) {
  const hashGroups = {};
  const duplicates = [];

  // Group resources by their etag (file hash)
  resources.forEach(resource => {
    const hash = resource.etag;
    if (!hashGroups[hash]) {
      hashGroups[hash] = [];
    }
    hashGroups[hash].push(resource);
  });

  // Find groups with more than one file (duplicates)
  Object.values(hashGroups).forEach(group => {
    if (group.length > 1) {
      // Sort by created_at to keep the oldest
      const sortedGroup = group.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      duplicates.push({
        hash: group[0].etag,
        count: group.length,
        keep: sortedGroup[0],
        remove: sortedGroup.slice(1)
      });
    }
  });

  return duplicates;
}

// Find unused resources (not referenced in database)
// Excludes Cloudinary sample files
function findUnusedResources(resources, usedUrls) {
  // Extract public_ids from used URLs for better matching
  const usedPublicIds = new Set();
  usedUrls.forEach(url => {
    // Extract public_id from URL (everything after /upload/vXXXX/ or /upload/)
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (match) {
      usedPublicIds.add(match[1]);
    }
  });
  
  console.log('Used public_ids:', Array.from(usedPublicIds));
  
  const unused = resources.filter(resource => {
    const publicId = resource.public_id;
    
    // Skip Cloudinary sample files - these are demo files and shouldn't be deleted
    if (publicId.startsWith('samples/') || publicId.startsWith('cld-sample') || publicId === 'sample') {
      return false;
    }
    
    // Check if this public_id is in our used set
    if (usedPublicIds.has(publicId)) {
      console.log('KEEPING (in use):', publicId);
      return false;
    }
    
    console.log('MARKING UNUSED:', publicId);
    return true;
  });

  return unused;
}

// GET - Analyze Cloudinary for duplicates and unused files
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For security, you might want to check if user is admin
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    // }

    const usedUrls = await getUsedMediaUrls();
    const allResources = await getAllCloudinaryResources();
    const duplicates = findDuplicatesByHash(allResources);
    const unused = findUnusedResources(allResources, usedUrls);

    // Calculate potential space savings
    const duplicateSize = duplicates.reduce((total, dup) => {
      return total + dup.remove.reduce((sum, resource) => sum + (resource.bytes || 0), 0);
    }, 0);

    const unusedSize = unused.reduce((total, resource) => total + (resource.bytes || 0), 0);

    return NextResponse.json({
      summary: {
        totalResources: allResources.length,
        usedResources: usedUrls.size,
        duplicateGroups: duplicates.length,
        duplicateFiles: duplicates.reduce((sum, dup) => sum + dup.remove.length, 0),
        unusedFiles: unused.length,
        potentialSavings: {
          duplicates: Math.round(duplicateSize / 1024 / 1024), // MB
          unused: Math.round(unusedSize / 1024 / 1024), // MB
          total: Math.round((duplicateSize + unusedSize) / 1024 / 1024) // MB
        }
      },
      duplicates: duplicates.map(dup => ({
        hash: dup.hash,
        count: dup.count,
        keep: {
          public_id: dup.keep.public_id,
          created_at: dup.keep.created_at,
          size: Math.round((dup.keep.bytes || 0) / 1024) // KB
        },
        remove: dup.remove.map(r => ({
          public_id: r.public_id,
          created_at: r.created_at,
          size: Math.round((r.bytes || 0) / 1024) // KB
        }))
      })),
      unused: unused.slice(0, 50).map(resource => ({ // Limit to first 50 for performance
        public_id: resource.public_id,
        url: resource.secure_url,
        created_at: resource.created_at,
        size: Math.round((resource.bytes || 0) / 1024), // KB
        format: resource.format
      })),
      hasMore: unused.length > 50
    });

  } catch (error) {
    console.error('Error analyzing Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to analyze Cloudinary resources' },
      { status: 500 }
    );
  }
}

// POST - Clean up duplicates and/or unused files
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For security, you might want to check if user is admin
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    // }

    const { deleteDuplicates = false, deleteUnused = false } = await request.json();

    if (!deleteDuplicates && !deleteUnused) {
      return NextResponse.json({ error: "No cleanup action specified" }, { status: 400 });
    }

    const usedUrls = await getUsedMediaUrls();
    const allResources = await getAllCloudinaryResources();
    
    let totalDeleted = 0;
    const results = {
      duplicates: { success: 0, failed: 0 },
      unused: { success: 0, failed: 0 }
    };

    // Delete duplicates
    if (deleteDuplicates) {
      const duplicates = findDuplicatesByHash(allResources);
      const duplicatesToDelete = duplicates.flatMap(dup => dup.remove);
      
      if (duplicatesToDelete.length > 0) {
        // Group by resource_type for proper deletion
        const imageResources = duplicatesToDelete.filter(r => r.resource_type === 'image');
        const videoResources = duplicatesToDelete.filter(r => r.resource_type === 'video');
        const rawResources = duplicatesToDelete.filter(r => r.resource_type === 'raw');
        
        // Delete images
        if (imageResources.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < imageResources.length; i += batchSize) {
            const batch = imageResources.slice(i, i + batchSize);
            const publicIds = batch.map(resource => resource.public_id);
            try {
              const result = await cloudinary.api.delete_resources(publicIds, { resource_type: 'image' });
              Object.entries(result.deleted || {}).forEach(([publicId, status]) => {
                if (status === 'deleted') { results.duplicates.success++; totalDeleted++; }
                else { results.duplicates.failed++; }
              });
            } catch (error) {
              console.error('Error deleting image duplicates:', error.message);
              results.duplicates.failed += batch.length;
            }
            if (i + batchSize < imageResources.length) await new Promise(r => setTimeout(r, 500));
          }
        }
        
        // Delete videos
        if (videoResources.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < videoResources.length; i += batchSize) {
            const batch = videoResources.slice(i, i + batchSize);
            const publicIds = batch.map(resource => resource.public_id);
            try {
              const result = await cloudinary.api.delete_resources(publicIds, { resource_type: 'video' });
              Object.entries(result.deleted || {}).forEach(([publicId, status]) => {
                if (status === 'deleted') { results.duplicates.success++; totalDeleted++; }
                else { results.duplicates.failed++; }
              });
            } catch (error) {
              console.error('Error deleting video duplicates:', error.message);
              results.duplicates.failed += batch.length;
            }
            if (i + batchSize < videoResources.length) await new Promise(r => setTimeout(r, 500));
          }
        }
        
        // Delete raw files
        if (rawResources.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < rawResources.length; i += batchSize) {
            const batch = rawResources.slice(i, i + batchSize);
            const publicIds = batch.map(resource => resource.public_id);
            try {
              const result = await cloudinary.api.delete_resources(publicIds, { resource_type: 'raw' });
              Object.entries(result.deleted || {}).forEach(([publicId, status]) => {
                if (status === 'deleted') { results.duplicates.success++; totalDeleted++; }
                else { results.duplicates.failed++; }
              });
            } catch (error) {
              console.error('Error deleting raw duplicates:', error.message);
              results.duplicates.failed += batch.length;
            }
            if (i + batchSize < rawResources.length) await new Promise(r => setTimeout(r, 500));
          }
        }
      }
    }

    // Delete unused files
    if (deleteUnused) {
      const unused = findUnusedResources(allResources, usedUrls);
      
      if (unused.length > 0) {
        // Group by resource_type for proper deletion
        const imageResources = unused.filter(r => r.resource_type === 'image');
        const videoResources = unused.filter(r => r.resource_type === 'video');
        const rawResources = unused.filter(r => r.resource_type === 'raw');
        
        // Delete images
        if (imageResources.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < imageResources.length; i += batchSize) {
            const batch = imageResources.slice(i, i + batchSize);
            const publicIds = batch.map(resource => resource.public_id);
            try {
              const result = await cloudinary.api.delete_resources(publicIds, { resource_type: 'image' });
              Object.entries(result.deleted || {}).forEach(([publicId, status]) => {
                if (status === 'deleted') { results.unused.success++; totalDeleted++; }
                else { results.unused.failed++; }
              });
            } catch (error) {
              console.error('Error deleting unused images:', error.message);
              results.unused.failed += batch.length;
            }
            if (i + batchSize < imageResources.length) await new Promise(r => setTimeout(r, 500));
          }
        }
        
        // Delete videos
        if (videoResources.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < videoResources.length; i += batchSize) {
            const batch = videoResources.slice(i, i + batchSize);
            const publicIds = batch.map(resource => resource.public_id);
            try {
              const result = await cloudinary.api.delete_resources(publicIds, { resource_type: 'video' });
              Object.entries(result.deleted || {}).forEach(([publicId, status]) => {
                if (status === 'deleted') { results.unused.success++; totalDeleted++; }
                else { results.unused.failed++; }
              });
            } catch (error) {
              console.error('Error deleting unused videos:', error.message);
              results.unused.failed += batch.length;
            }
            if (i + batchSize < videoResources.length) await new Promise(r => setTimeout(r, 500));
          }
        }
        
        // Delete raw files
        if (rawResources.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < rawResources.length; i += batchSize) {
            const batch = rawResources.slice(i, i + batchSize);
            const publicIds = batch.map(resource => resource.public_id);
            try {
              const result = await cloudinary.api.delete_resources(publicIds, { resource_type: 'raw' });
              Object.entries(result.deleted || {}).forEach(([publicId, status]) => {
                if (status === 'deleted') { results.unused.success++; totalDeleted++; }
                else { results.unused.failed++; }
              });
            } catch (error) {
              console.error('Error deleting unused raw files:', error.message);
              results.unused.failed += batch.length;
            }
            if (i + batchSize < rawResources.length) await new Promise(r => setTimeout(r, 500));
          }
        }
      }
    }

    return NextResponse.json({
      message: `Cleanup completed. ${totalDeleted} files deleted.`,
      results,
      totalDeleted
    });

  } catch (error) {
    console.error('Error during Cloudinary cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup Cloudinary resources' },
      { status: 500 }
    );
  }
}
