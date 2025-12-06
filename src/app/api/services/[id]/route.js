import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const splitUrl = url.split('/');
    const lastSegment = splitUrl.pop();
    const publicId = lastSegment.split('.')[0];
    
    const uploadIndex = splitUrl.findIndex(segment => segment === 'upload');
    if (uploadIndex === -1) return publicId;
    
    let pathSegments = splitUrl.slice(uploadIndex + 1);
    if (pathSegments[0] && pathSegments[0].startsWith('v') && !isNaN(Number(pathSegments[0].substring(1)))) {
        pathSegments.shift();
    }
    
    return [...pathSegments, publicId].join('/');
  } catch (error) {
    console.error("Error parsing Cloudinary URL:", error);
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  if (!url) return;
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;

  const resourceType = url.includes('/video/') ? 'video' : 'image';
  
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const body = await request.json();
    
    // Get existing service to check for image change
    const existingService = await db.collection("services").findOne({ _id: new ObjectId(id) });
    
    if (existingService && existingService.image && existingService.image !== body.image) {
        // Image has changed or been removed, delete the old one
        await deleteFromCloudinary(existingService.image);
    }

    // Remove _id from body if present to avoid immutable field error
    const { _id, ...updateData } = body;

    const result = await db.collection("services").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Get existing service to delete image
    const existingService = await db.collection("services").findOne({ _id: new ObjectId(id) });
    
    if (existingService && existingService.image) {
        await deleteFromCloudinary(existingService.image);
    }

    const result = await db.collection("services").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
