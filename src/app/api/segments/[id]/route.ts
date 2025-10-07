import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SEGMENT_CACHE_TIME = 10; // seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // ms

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const segmentId = params.id;
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Validate segment ID
  if (!/^\d{3}$/.test(segmentId)) {
    console.warn(`Invalid segment ID: ${segmentId} from ${clientIP}`);
    return new NextResponse('Invalid segment ID', { status: 400 });
  }

  const segmentName = `segment_${segmentId}.ts`;
  const segmentPath = path.join(process.cwd(), 'public', 'hls', segmentName);
  
  // Retry logic for segment availability
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const segment = await fs.readFile(segmentPath);
      
      console.log(`Serving segment ${segmentId} to ${clientIP} (attempt ${attempt})`);
      
      return new NextResponse(segment, {
        headers: {
          'Content-Type': 'video/mp2t',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': `public, max-age=${SEGMENT_CACHE_TIME}`,
          'Content-Length': segment.length.toString(),
        },
      });
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(`Segment ${segmentId} not found after ${MAX_RETRIES} attempts:`, error);
        return new NextResponse('Segment not found', { status: 404 });
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
  
  return new NextResponse('Segment unavailable', { status: 503 });
}