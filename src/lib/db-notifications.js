import clientPromise from "@/lib/mongodb";

export async function createNotification({ type, message, recipient = 'admin', relatedId = null, link = null }) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const notification = {
      type, // 'success', 'info', 'warning', 'error'
      message,
      recipient, // 'admin' or specific userId
      relatedId, // e.g., artistId
      link, // optional link to resource
      read: false,
      timestamp: new Date()
    };

    await db.collection("notifications").insertOne(notification);
    return true;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return false;
  }
}
