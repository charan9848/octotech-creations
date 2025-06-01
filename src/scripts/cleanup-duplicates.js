// Script to clean up duplicate entries in the artists collection
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client;
}

async function cleanupDuplicates() {
  let client;
  
  try {
    console.log("Starting duplicate cleanup process...");
    
    client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const artists = db.collection("artists");

    // Find and remove duplicate emails (keep the first one)
    console.log("\n🔍 Finding duplicate emails...");
    const emailDuplicates = await artists.aggregate([
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 },
          docs: { $push: { _id: "$_id", artistid: "$artistid", createdAt: "$createdAt" } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (emailDuplicates.length > 0) {
      console.log(`📧 Found ${emailDuplicates.length} emails with duplicates`);
      
      for (const dup of emailDuplicates) {
        // Sort by creation date (keep oldest) or by _id if no createdAt
        const sortedDocs = dup.docs.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          return a._id.toString().localeCompare(b._id.toString());
        });
        
        // Remove all except the first one
        const toRemove = sortedDocs.slice(1);
        console.log(`  Email: ${dup._id}`);
        console.log(`    Keeping: ${sortedDocs[0].artistid} (${sortedDocs[0]._id})`);
        
        for (const doc of toRemove) {
          console.log(`    Removing: ${doc.artistid} (${doc._id})`);
          await artists.deleteOne({ _id: doc._id });
        }
      }
      console.log("✅ Email duplicates cleaned up");
    } else {
      console.log("✅ No duplicate emails found");
    }

    // Find and remove duplicate artistids (keep the first one)
    console.log("\n🔍 Finding duplicate artist IDs...");
    const artistIdDuplicates = await artists.aggregate([
      {
        $group: {
          _id: "$artistid",
          count: { $sum: 1 },
          docs: { $push: { _id: "$_id", email: "$email", createdAt: "$createdAt" } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (artistIdDuplicates.length > 0) {
      console.log(`🎭 Found ${artistIdDuplicates.length} artist IDs with duplicates`);
      
      for (const dup of artistIdDuplicates) {
        // Sort by creation date (keep oldest) or by _id if no createdAt
        const sortedDocs = dup.docs.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          return a._id.toString().localeCompare(b._id.toString());
        });
        
        // Remove all except the first one
        const toRemove = sortedDocs.slice(1);
        console.log(`  Artist ID: ${dup._id}`);
        console.log(`    Keeping: ${sortedDocs[0].email} (${sortedDocs[0]._id})`);
        
        for (const doc of toRemove) {
          console.log(`    Removing: ${doc.email} (${doc._id})`);
          await artists.deleteOne({ _id: doc._id });
        }
      }
      console.log("✅ Artist ID duplicates cleaned up");
    } else {
      console.log("✅ No duplicate artist IDs found");
    }

    console.log("\n🎉 Duplicate cleanup completed successfully!");
    
    // Show final count
    const totalArtists = await artists.countDocuments();    console.log(`📊 Total artists remaining: ${totalArtists}`);
    
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupDuplicates().then(() => {
    console.log("\n✨ Cleanup completed successfully!");
    process.exit(0);
  }).catch(error => {
    console.error("\n💥 Cleanup failed:", error);
    process.exit(1);
  });
}

export { cleanupDuplicates };
