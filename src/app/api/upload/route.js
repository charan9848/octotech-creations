import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.error('Cloudinary environment variables are missing');
}

cloudinary.config(cloudinaryConfig);

export async function POST(request) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Server configuration error: Cloudinary credentials missing' }, { status: 500 });
    }

    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for images

    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size: ${isVideo ? '100MB' : '10MB'}` 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with appropriate settings
    const uploadOptions = {
      resource_type: isVideo ? 'video' : 'auto',
      folder: 'artist-profiles',
    };

    // For videos, add transformation options
    if (isVideo) {
      uploadOptions.eager = [
        { format: 'mp4', video_codec: 'h264' }
      ];
      uploadOptions.eager_async = true;
    }

    const response = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      message: 'Upload successful',
      url: response.secure_url,
      public_id: response.public_id,
      resource_type: response.resource_type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');
    const url = searchParams.get('url');

    if (!publicId && !url) {
      return NextResponse.json({ error: 'No public_id or url provided' }, { status: 400 });
    }

    let targetPublicId = publicId;
    let resourceType = 'image'; // Default to image
    
    // If URL is provided but no public_id, extract public_id from URL
    if (!publicId && url) {
      // Determine resource type from URL
      if (url.includes('/video/upload/') || url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
        resourceType = 'video';
      }
      
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      // Remove file extension to get public_id
      targetPublicId = lastPart.split('.')[0];
      
      // For nested folders, include folder path
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1) {
        // Get everything after 'upload' and version (vXXXXXX)
        let pathParts = urlParts.slice(uploadIndex + 1);
        // Remove version if present
        if (pathParts[0] && pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
          pathParts.shift();
        }
        // Remove the filename from path
        pathParts.pop();
        if (pathParts.length > 0) {
          targetPublicId = `${pathParts.join('/')}/${targetPublicId}`;
        }
      }
    }

    console.log(`Deleting from Cloudinary: ${targetPublicId} (${resourceType})`);

    // Try to delete with detected resource type first
    let response = await cloudinary.uploader.destroy(targetPublicId, {
      resource_type: resourceType
    });

    // If not found as image, try as video
    if (response.result === 'not found' && resourceType === 'image') {
      console.log('Not found as image, trying as video...');
      response = await cloudinary.uploader.destroy(targetPublicId, {
        resource_type: 'video'
      });
    }

    // If still not found as video, try as raw
    if (response.result === 'not found') {
      console.log('Not found as video, trying as raw...');
      response = await cloudinary.uploader.destroy(targetPublicId, {
        resource_type: 'raw'
      });
    }

    if (response.result === 'ok' || response.result === 'not found') {
      return NextResponse.json({
        message: 'Delete successful',
        result: response.result,
        public_id: targetPublicId
      });
    } else {
      throw new Error(`Delete failed: ${response.result}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed', details: error.message },
      { status: 500 }
    );
  }
}
