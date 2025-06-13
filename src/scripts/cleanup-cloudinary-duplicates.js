// Script to clean up duplicate files in Cloudinary
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { v2: cloudinary } = require('cloudinary');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../../.env.local');
console.log('Loading environment from:', envPath);
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.error('Error loading .env.local:', envResult.error);
  process.exit(1);
}

// Verify required environment variables
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET',
  'MONGODB_URI',
  'MONGODB_DB'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client;
}

// Get all used media URLs from the database
async function getUsedMediaUrls(client) {
  const db = client.db(process.env.MONGODB_DB);
  const usedUrls = new Set();

  try {
    console.log("🔍 Scanning database for used media URLs...");

    // Get profile images from artists collection
    const artists = await db.collection("artists").find({}).toArray();
    artists.forEach(artist => {
      if (artist.image && artist.image.includes('cloudinary')) {
        usedUrls.add(artist.image);
      }
    });
    console.log(`   Found ${artists.length} artist profiles`);

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
    console.log(`   Found ${portfolios.length} portfolios`);

    console.log(`✅ Total unique URLs found in database: ${usedUrls.size}`);
    return usedUrls;

  } catch (error) {
    console.error("❌ Error scanning database:", error);
    throw error;
  }
}

// Get all resources from Cloudinary
async function getAllCloudinaryResources() {
  console.log("🔍 Fetching all resources from Cloudinary...");
  
  const allResources = [];

  try {
    // First, try to get image resources
    console.log("   Fetching image resources...");
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

        console.log(`   Fetched ${result.resources.length} images (Total: ${allResources.length})`);
      } while (nextCursor);
    } catch (imageError) {
      if (imageError.http_code === 404) {
        console.log("   No image resources found");
      } else {
        console.warn("   Warning: Could not fetch image resources:", imageError.message);
      }
    }

    // Then try to get video resources
    console.log("   Fetching video resources...");
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

        console.log(`   Fetched ${videoResult.resources.length} videos (Total: ${allResources.length})`);
      } while (videoNextCursor);
    } catch (videoError) {
      if (videoError.http_code === 404) {
        console.log("   No video resources found");
      } else {
        console.warn("   Warning: Could not fetch video resources:", videoError.message);
      }
    }

    // Try raw files as well
    console.log("   Fetching raw resources...");
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

        console.log(`   Fetched ${rawResult.resources.length} raw files (Total: ${allResources.length})`);
      } while (rawNextCursor);
    } catch (rawError) {
      if (rawError.http_code === 404) {
        console.log("   No raw resources found");
      } else {
        console.warn("   Warning: Could not fetch raw resources:", rawError.message);
      }
    }

    console.log(`✅ Total resources in Cloudinary: ${allResources.length}`);
    return allResources;

  } catch (error) {
    console.error("❌ Error fetching Cloudinary resources:", error);
    throw error;
  }
}

// Find duplicate resources based on file hash/etag
function findDuplicatesByHash(resources) {
  console.log("🔍 Finding duplicates by file hash...");
  
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

  console.log(`✅ Found ${duplicates.length} groups of duplicate files`);
  return duplicates;
}

// Find unused resources (not referenced in database)
function findUnusedResources(resources, usedUrls) {
  console.log("🔍 Finding unused resources...");
  
  const unused = resources.filter(resource => {
    const resourceUrl = resource.secure_url;
    return !usedUrls.has(resourceUrl);
  });

  console.log(`✅ Found ${unused.length} unused resources`);
  return unused;
}

// Delete resources from Cloudinary
async function deleteResources(resources, type = 'unused') {
  if (resources.length === 0) {
    console.log(`✅ No ${type} resources to delete`);
    return { success: 0, failed: 0 };
  }

  console.log(`🗑️  Deleting ${resources.length} ${type} resources...`);
  
  let successCount = 0;
  let failedCount = 0;
  const batchSize = 100; // Cloudinary API limit

  for (let i = 0; i < resources.length; i += batchSize) {
    const batch = resources.slice(i, i + batchSize);
    const publicIds = batch.map(resource => resource.public_id);

    try {
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: 'auto'
      });

      Object.entries(result.deleted).forEach(([publicId, status]) => {
        if (status === 'deleted') {
          successCount++;
          console.log(`   ✅ Deleted: ${publicId}`);
        } else {
          failedCount++;
          console.log(`   ❌ Failed to delete: ${publicId} (${status})`);
        }
      });

      // Rate limiting - wait between batches
      if (i + batchSize < resources.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`❌ Error deleting batch starting at index ${i}:`, error);
      failedCount += batch.length;
    }
  }

  console.log(`✅ Deletion complete: ${successCount} successful, ${failedCount} failed`);
  return { success: successCount, failed: failedCount };
}

// Main cleanup function
async function cleanupCloudinaryDuplicates(options = {}) {
  const {
    deleteDuplicates = false,
    deleteUnused = false,
    dryRun = true
  } = options;

  let client;
  let totalDeleted = 0;

  try {
    console.log("🚀 Starting Cloudinary cleanup process...");
    console.log(`   Mode: ${dryRun ? 'DRY RUN (no files will be deleted)' : 'LIVE DELETION'}`);
    console.log(`   Delete duplicates: ${deleteDuplicates}`);
    console.log(`   Delete unused: ${deleteUnused}`);

    // Test Cloudinary connection first
    try {
      const usage = await cloudinary.api.usage();
      console.log(`✅ Cloudinary connection successful`);
      console.log(`   Storage used: ${Math.round(usage.storage.used_bytes / 1024 / 1024)} MB`);
    } catch (connectionError) {
      console.error("❌ Failed to connect to Cloudinary:", connectionError.message);
      throw new Error("Cannot connect to Cloudinary. Please check your credentials.");
    }

    // Connect to database
    client = await getMongoClient();

    // Get used URLs from database
    const usedUrls = await getUsedMediaUrls(client);

    // Get all Cloudinary resources
    const allResources = await getAllCloudinaryResources();

    if (allResources.length === 0) {
      console.log("ℹ️  No resources found in Cloudinary account.");
      console.log("   This could mean:");
      console.log("   - The account is empty");
      console.log("   - Resources are in folders not being scanned");
      console.log("   - Account has restricted access");
      return;
    }

    // Find duplicates
    const duplicates = findDuplicatesByHash(allResources);
    
    // Find unused resources
    const unused = findUnusedResources(allResources, usedUrls);

    // Summary
    console.log("\n📊 SUMMARY:");
    console.log(`   Total resources in Cloudinary: ${allResources.length}`);
    console.log(`   Used resources in database: ${usedUrls.size}`);
    console.log(`   Duplicate groups found: ${duplicates.length}`);
    console.log(`   Unused resources found: ${unused.length}`);

    if (duplicates.length > 0) {
      console.log("\n🔄 DUPLICATE DETAILS:");
      duplicates.forEach((dup, index) => {
        console.log(`   Group ${index + 1}: ${dup.count} files with same hash`);
        console.log(`     Keep: ${dup.keep.public_id} (${dup.keep.created_at})`);
        dup.remove.forEach(resource => {
          console.log(`     Remove: ${resource.public_id} (${resource.created_at})`);
        });
      });
    }

    if (unused.length > 0) {
      console.log("\n🗑️  UNUSED RESOURCES:");
      unused.slice(0, 10).forEach(resource => {
        console.log(`   ${resource.public_id} (${resource.format}, ${Math.round(resource.bytes / 1024)}KB)`);
      });
      if (unused.length > 10) {
        console.log(`   ... and ${unused.length - 10} more`);
      }
    }

    if (!dryRun) {
      // Delete duplicates
      if (deleteDuplicates && duplicates.length > 0) {
        const duplicatesToDelete = duplicates.flatMap(dup => dup.remove);
        const result = await deleteResources(duplicatesToDelete, 'duplicate');
        totalDeleted += result.success;
      }

      // Delete unused resources
      if (deleteUnused && unused.length > 0) {
        const result = await deleteResources(unused, 'unused');
        totalDeleted += result.success;
      }

      console.log(`\n🎉 Cleanup completed! Total files deleted: ${totalDeleted}`);
    } else {
      console.log("\n💡 This was a dry run. Use --live flag to actually delete files.");
    }

    // Calculate space saved
    const duplicateSize = duplicates.reduce((total, dup) => {
      return total + dup.remove.reduce((sum, resource) => sum + (resource.bytes || 0), 0);
    }, 0);

    const unusedSize = unused.reduce((total, resource) => total + (resource.bytes || 0), 0);

    console.log(`\n💾 POTENTIAL SPACE SAVINGS:`);
    console.log(`   Duplicates: ${Math.round(duplicateSize / 1024 / 1024)} MB`);
    console.log(`   Unused: ${Math.round(unusedSize / 1024 / 1024)} MB`);
    console.log(`   Total: ${Math.round((duplicateSize + unusedSize) / 1024 / 1024)} MB`);

  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    if (error.http_code) {
      console.error(`   HTTP Status: ${error.http_code}`);
    }
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    deleteDuplicates: args.includes('--duplicates'),
    deleteUnused: args.includes('--unused'),
    dryRun: !args.includes('--live')
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧹 Cloudinary Cleanup Tool

Usage: node cleanup-cloudinary-duplicates.js [options]

Options:
  --duplicates    Delete duplicate files (keeps oldest)
  --unused        Delete unused files (not referenced in database)
  --live          Actually delete files (default is dry run)
  --help, -h      Show this help message

Examples:
  node cleanup-cloudinary-duplicates.js
    # Dry run - show what would be deleted

  node cleanup-cloudinary-duplicates.js --duplicates --live
    # Delete duplicate files

  node cleanup-cloudinary-duplicates.js --unused --live
    # Delete unused files

  node cleanup-cloudinary-duplicates.js --duplicates --unused --live
    # Delete both duplicates and unused files
    `);
    return;
  }

  try {
    await cleanupCloudinaryDuplicates(options);
    console.log("\n✨ Cleanup completed successfully!");
  } catch (error) {
    console.error("\n💥 Cleanup failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { cleanupCloudinaryDuplicates };
