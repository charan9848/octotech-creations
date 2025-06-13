// Safe Cloudinary cleanup - focuses only on user uploads
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { v2: cloudinary } = require('cloudinary');

// Load environment variables
const envPath = path.join(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getMongoClient() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client;
}

// Get used URLs from database
async function getUsedMediaUrls(client) {
  const db = client.db(process.env.MONGODB_DB);
  const usedUrls = new Set();

  const artists = await db.collection("artists").find({}).toArray();
  artists.forEach(artist => {
    if (artist.image && artist.image.includes('cloudinary')) {
      usedUrls.add(artist.image);
    }
  });

  const portfolios = await db.collection("portfolios").find({}).toArray();
  portfolios.forEach(portfolio => {
    if (portfolio.basicDetails?.portfolioImage && portfolio.basicDetails.portfolioImage.includes('cloudinary')) {
      usedUrls.add(portfolio.basicDetails.portfolioImage);
    }
    if (portfolio.artworks && Array.isArray(portfolio.artworks)) {
      portfolio.artworks.forEach(artwork => {
        if (artwork.image && artwork.image.includes('cloudinary')) {
          usedUrls.add(artwork.image);
        }
      });
    }
  });

  return usedUrls;
}

// Get user-uploaded resources (exclude Cloudinary samples)
async function getUserUploadedResources() {
  const userResources = [];
  
  try {
    // Fetch from user folders
    const folders = ['artist-profiles', 'octotech'];
    
    for (const folder of folders) {
      try {
        let nextCursor = null;
        do {
          const options = {
            resource_type: 'image',
            max_results: 100,
            type: 'upload',
            prefix: folder
          };

          if (nextCursor) {
            options.next_cursor = nextCursor;
          }

          const result = await cloudinary.api.resources(options);
          userResources.push(...result.resources);
          nextCursor = result.next_cursor;
        } while (nextCursor);
      } catch (error) {
        if (error.http_code !== 404) {
          console.warn(`Could not fetch resources from ${folder}:`, error.message);
        }
      }
    }

    // Also check for video resources in these folders
    for (const folder of folders) {
      try {
        let nextCursor = null;
        do {
          const options = {
            resource_type: 'video',
            max_results: 100,
            type: 'upload',
            prefix: folder
          };

          if (nextCursor) {
            options.next_cursor = nextCursor;
          }

          const result = await cloudinary.api.resources(options);
          userResources.push(...result.resources);
          nextCursor = result.next_cursor;
        } while (nextCursor);
      } catch (error) {
        if (error.http_code !== 404) {
          console.warn(`Could not fetch video resources from ${folder}:`, error.message);
        }
      }
    }

    // Also check root level user uploads (not in samples)
    try {
      let nextCursor = null;
      do {
        const options = {
          resource_type: 'auto',
          max_results: 100,
          type: 'upload'
        };

        if (nextCursor) {
          options.next_cursor = nextCursor;
        }

        const result = await cloudinary.api.resources(options);
        
        // Filter out sample files
        const nonSampleResources = result.resources.filter(resource => 
          !resource.public_id.startsWith('samples/') && 
          !resource.public_id.startsWith('cld-sample')
        );
        
        userResources.push(...nonSampleResources);
        nextCursor = result.next_cursor;
      } while (nextCursor);
    } catch (error) {
      if (error.http_code !== 404) {
        console.warn("Could not fetch root level resources:", error.message);
      }
    }

    // Remove duplicates based on public_id
    const uniqueResources = [];
    const seenIds = new Set();
    
    userResources.forEach(resource => {
      if (!seenIds.has(resource.public_id)) {
        seenIds.add(resource.public_id);
        uniqueResources.push(resource);
      }
    });

    return uniqueResources;
  } catch (error) {
    console.error("Error fetching user resources:", error);
    throw error;
  }
}

// Find unused user resources
function findUnusedUserResources(resources, usedUrls) {
  return resources.filter(resource => {
    const resourceUrl = resource.secure_url;
    return !usedUrls.has(resourceUrl);
  });
}

// Safe cleanup - only remove unused user uploads
async function safeCloudinaryCleanup(dryRun = true) {
  let client;
  
  try {
    console.log("🧹 Starting SAFE Cloudinary cleanup...");
    console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE DELETION'}`);
    console.log("   Focus: User uploads only (excludes Cloudinary samples)");

    // Test connection
    const usage = await cloudinary.api.usage();
    console.log(`✅ Connected to Cloudinary`);

    // Connect to database
    client = await getMongoClient();
    const usedUrls = await getUsedMediaUrls(client);

    // Get user resources only
    const userResources = await getUserUploadedResources();
    console.log(`📁 Found ${userResources.length} user-uploaded resources`);

    // Find unused resources
    const unused = findUnusedUserResources(userResources, usedUrls);

    console.log("\n📊 SAFE CLEANUP SUMMARY:");
    console.log(`   User resources: ${userResources.length}`);
    console.log(`   Used in database: ${usedUrls.size}`);
    console.log(`   Unused user uploads: ${unused.length}`);

    if (unused.length > 0) {
      console.log("\n🗑️  UNUSED USER UPLOADS:");
      unused.forEach((resource, index) => {
        if (index < 20) { // Show first 20
          console.log(`   ${resource.public_id} (${resource.format}, ${Math.round(resource.bytes / 1024)}KB, ${resource.created_at})`);
        }
      });
      if (unused.length > 20) {
        console.log(`   ... and ${unused.length - 20} more`);
      }

      const totalSize = unused.reduce((sum, resource) => sum + (resource.bytes || 0), 0);
      console.log(`\n💾 Space savings: ${Math.round(totalSize / 1024 / 1024)} MB`);

      if (!dryRun) {
        console.log("\n🗑️  Deleting unused user uploads...");
          let successCount = 0;
        let failedCount = 0;
        const batchSize = 10; // Smaller batches for safety

        for (let i = 0; i < unused.length; i += batchSize) {
          const batch = unused.slice(i, i + batchSize);
          const publicIds = batch.map(resource => resource.public_id);
            try {
            // Try to delete as images first
            const result = await cloudinary.api.delete_resources(publicIds, {
              resource_type: 'image'
            });

            Object.entries(result.deleted || {}).forEach(([publicId, status]) => {
              if (status === 'deleted') {
                successCount++;
                console.log(`   ✅ Deleted: ${publicId}`);
              } else {
                failedCount++;
                console.log(`   ❌ Failed: ${publicId} (${status})`);
              }
            });

            // Handle any errors returned in the result
            if (result.deleted_counts) {
              console.log(`   Batch result: ${result.deleted_counts.deleted || 0} deleted, ${result.deleted_counts.not_found || 0} not found`);
            }

            // For any not found items, try as video resources
            const notFoundIds = Object.entries(result.deleted || {})
              .filter(([publicId, status]) => status === 'not_found')
              .map(([publicId]) => publicId);

            if (notFoundIds.length > 0) {
              try {
                const videoResult = await cloudinary.api.delete_resources(notFoundIds, {
                  resource_type: 'video'
                });

                Object.entries(videoResult.deleted || {}).forEach(([publicId, status]) => {
                  if (status === 'deleted') {
                    successCount++;
                    failedCount--; // Adjust count since we previously counted it as failed
                    console.log(`   ✅ Deleted (video): ${publicId}`);
                  }
                });
              } catch (videoError) {
                console.log(`   ⚠️  Could not delete as video: ${notFoundIds.length} items`);
              }
            }

          } catch (error) {
            console.error(`❌ Error deleting batch:`, error.message || error);
            console.error(`   Public IDs in failed batch:`, publicIds.join(', '));
            failedCount += batch.length;
          }
        }

        console.log(`\n🎉 Cleanup completed: ${successCount} deleted, ${failedCount} failed`);
      } else {
        console.log("\n💡 Use --live flag to actually delete these files");
      }
    } else {
      console.log("\n✅ No unused user uploads found - account is clean!");
    }

  } catch (error) {
    console.error("❌ Safe cleanup failed:", error.message);
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
  const dryRun = !args.includes('--live');

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧹 Safe Cloudinary Cleanup Tool

This tool safely removes only unused user-uploaded files.
It excludes Cloudinary sample files to prevent accidental deletion.

Usage: node safe-cloudinary-cleanup.js [options]

Options:
  --live      Actually delete files (default is dry run)
  --help, -h  Show this help message

Examples:
  node safe-cloudinary-cleanup.js
    # Dry run - show what would be deleted

  node safe-cloudinary-cleanup.js --live
    # Delete unused user uploads
    `);
    return;
  }

  try {
    await safeCloudinaryCleanup(dryRun);
    console.log("\n✨ Safe cleanup completed!");
  } catch (error) {
    console.error("\n💥 Cleanup failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { safeCloudinaryCleanup };
