import { NextResponse } from 'next/server';
import os from 'os';
import fs from 'fs';
import path from 'path';
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to calculate directory size
const getDirSize = (dirPath) => {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (e) {
    // Ignore errors (e.g. if folder doesn't exist)
  }
  return size;
};

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = Math.round((usedMem / totalMem) * 100);

    // 2. CPU Usage (Sampled over 100ms)
    const startMeasure = cpuAverage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endMeasure = cpuAverage();
    
    const idleDifference = endMeasure.idle - startMeasure.idle;
    const totalDifference = endMeasure.total - startMeasure.total;
    const cpuUsage = 100 - Math.floor(100 * idleDifference / totalDifference);

    // 3. MongoDB Storage Usage
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const stats = await db.stats();
    
    // Convert bytes to MB
    const storageUsedMB = (stats.storageSize / 1024 / 1024).toFixed(2);
    
    // Estimate percentage based on a typical 512MB Free Tier (Adjust if you have a larger plan)
    const totalStorageMB = 512; 
    const storageUsage = Math.min(parseFloat(((storageUsedMB / totalStorageMB) * 100).toFixed(2)), 100);

    // 4. Cloudinary Usage
    let cloudinaryUsage = {
      usagePercent: 0,
      usedMB: 0,
      totalMB: 0,
      credits: {
        used: 0,
        total: 0,
        percent: 0
      }
    };

    try {
      const usage = await cloudinary.api.usage();
      
      if (usage.storage) {
         const usedBytes = usage.storage.usage || 0;
         // Free tier usually has 25GB limit or credit based. 
         // If limit is 0, it might be credit based.
         const limitBytes = usage.storage.limit || (25 * 1024 * 1024 * 1024); // Default to 25GB if unknown
         
         cloudinaryUsage.usedMB = (usedBytes / 1024 / 1024).toFixed(2);
         cloudinaryUsage.totalMB = (limitBytes / 1024 / 1024).toFixed(2);
         cloudinaryUsage.usagePercent = parseFloat(((usedBytes / limitBytes) * 100).toFixed(2));
      }
      
      if (usage.credits) {
          cloudinaryUsage.credits.used = usage.credits.usage || 0;
          cloudinaryUsage.credits.total = usage.credits.limit || 0;
          if (usage.credits.limit > 0) {
              cloudinaryUsage.credits.percent = parseFloat(((usage.credits.usage / usage.credits.limit) * 100).toFixed(2));
              // Use credit percentage as the main indicator if available as it's more accurate for billing
              cloudinaryUsage.usagePercent = cloudinaryUsage.credits.percent;
          }
      }

    } catch (cError) {
        console.error("Cloudinary stats failed:", cError);
    }

    // 5. Project Source Size (Estimate for Vercel/GitHub)
    const srcSize = getDirSize(path.join(process.cwd(), 'src'));
    const publicSize = getDirSize(path.join(process.cwd(), 'public'));
    const totalProjectBytes = srcSize + publicSize;
    const totalProjectMB = (totalProjectBytes / 1024 / 1024).toFixed(2);
    
    // Vercel Serverless Function Limit (Unzipped) is 250MB
    const vercelLimitMB = 250;
    const projectUsagePercent = parseFloat(((totalProjectMB / vercelLimitMB) * 100).toFixed(2));

    return NextResponse.json({
      cpu: cpuUsage || 0,
      memory: memUsage,
      storage: {
        usagePercent: storageUsage,
        usedMB: storageUsedMB,
        totalMB: totalStorageMB
      },
      cloudinary: cloudinaryUsage,
      projectSize: {
        usedMB: totalProjectMB,
        totalMB: vercelLimitMB,
        usagePercent: projectUsagePercent
      },
      uptime: os.uptime()
    });

  } catch (error) {
    console.error("System health check failed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function cpuAverage() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }
  return { idle: idle / cpus.length, total: total / cpus.length };
}
