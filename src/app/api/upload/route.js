import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'artist-profiles', // Optional: organize uploads in folders
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      message: 'Upload successful',
      url: response.secure_url,
      public_id: response.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
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
    
    // If URL is provided but no public_id, extract public_id from URL
    if (!publicId && url) {
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      // Remove file extension to get public_id
      targetPublicId = lastPart.split('.')[0];
      
      // For nested folders, include folder path
      const folderIndex = urlParts.findIndex(part => part === 'artist-profiles');
      if (folderIndex !== -1 && folderIndex < urlParts.length - 1) {
        const folderPath = urlParts.slice(folderIndex, -1).join('/');
        targetPublicId = `${folderPath}/${targetPublicId}`;
      }
    }

    // Delete from Cloudinary
    const response = await cloudinary.uploader.destroy(targetPublicId, {
      resource_type: 'auto'
    });

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
