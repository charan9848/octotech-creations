// Script to setup database indexes for email and artistid uniqueness
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

async function setupDatabaseIndexes() {
  let client;
  
  try {
    console.log("🚀 Setting up database indexes...");
    
    client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const artists = db.collection("artists");

    // Check if indexes already exist
    const existingIndexes = await artists.listIndexes().toArray();
    const emailIndexExists = existingIndexes.some(idx => idx.name === "email_unique_index");
    const artistIdIndexExists = existingIndexes.some(idx => idx.name === "artistid_unique_index");

    // Create unique index on email field if it doesn't exist
    if (!emailIndexExists) {
      await artists.createIndex(
        { email: 1 }, 
        { 
          unique: true,
          name: "email_unique_index",
          background: true,
          sparse: true // Allow documents without email field during migration
        }
      );
      console.log("✅ Created unique index on email field");
    } else {
      console.log("📋 Email unique index already exists");
    }

    // Create unique index on artistid field if it doesn't exist
    if (!artistIdIndexExists) {
      await artists.createIndex(
        { artistid: 1 }, 
        { 
          unique: true,
          name: "artistid_unique_index",
          background: true,
          sparse: true // Allow documents without artistid field during migration
        }
      );
      console.log("✅ Created unique index on artistid field");
    } else {
      console.log("📋 Artist ID unique index already exists");
    }

    // Create additional performance indexes
    await artists.createIndex(
      { createdAt: 1 }, 
      { 
        name: "created_at_index",
        background: true
      }
    );
    console.log("✅ Created performance index on createdAt field");

    // List all indexes to confirm
    const indexes = await artists.listIndexes().toArray();
    console.log("\n📋 Current indexes:");
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log("\n🎉 Database indexes setup completed successfully!");
    
  } catch (error) {
    console.error("❌ Error setting up database indexes:", error);
    
    if (error.code === 11000) {
      console.log("\n⚠️  Duplicate key error occurred. This means there are already duplicate emails or artistids in the database.");
      console.log("Please clean up duplicates before creating unique indexes.");
      console.log("Run: npm run cleanup-duplicates");
      
      // Find and display duplicates
      if (client) {
        await findDuplicates(client);
      }
    }
    
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

async function findDuplicates(client) {
  try {
    const db = client.db(process.env.MONGODB_DB);
    const artists = db.collection("artists");

    console.log("\n🔍 Checking for duplicate emails...");
    const emailDuplicates = await artists.aggregate([
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 },
          docs: { $push: { artistid: "$artistid", _id: "$_id" } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (emailDuplicates.length > 0) {
      console.log("📧 Duplicate emails found:");
      emailDuplicates.forEach(dup => {
        console.log(`  Email: ${dup._id} (${dup.count} occurrences)`);
        dup.docs.forEach(doc => {
          console.log(`    - Artist ID: ${doc.artistid}, MongoDB ID: ${doc._id}`);
        });
      });
    } else {
      console.log("✅ No duplicate emails found");
    }

    console.log("\n🔍 Checking for duplicate artist IDs...");
    const artistIdDuplicates = await artists.aggregate([
      {
        $group: {
          _id: "$artistid",
          count: { $sum: 1 },
          docs: { $push: { email: "$email", _id: "$_id" } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (artistIdDuplicates.length > 0) {
      console.log("🎭 Duplicate artist IDs found:");
      artistIdDuplicates.forEach(dup => {
        console.log(`  Artist ID: ${dup._id} (${dup.count} occurrences)`);
        dup.docs.forEach(doc => {
          console.log(`    - Email: ${doc.email}, MongoDB ID: ${doc._id}`);
        });
      });
    } else {
      console.log("✅ No duplicate artist IDs found");
    }

  } catch (error) {
    console.error("❌ Error checking for duplicates:", error);
  }
}

// Run the setup if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabaseIndexes().then(() => {
    console.log("\n✨ Setup completed successfully!");
    process.exit(0);
  }).catch(error => {
    console.error("\n💥 Setup failed:", error);
    process.exit(1);
  });
}

export { setupDatabaseIndexes, findDuplicates };
