import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';

async function checkFFmpeg(): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpeg = spawn(FFMPEG_PATH, ['-version'], { stdio: 'pipe' });
    
    ffmpeg.on('error', () => resolve(false));
    ffmpeg.on('exit', (code) => resolve(code === 0));
    
    setTimeout(() => {
      ffmpeg.kill();
      resolve(false);
    }, 5000);
  });
}

export async function GET() {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
    checks: {
      ffmpeg: await checkFFmpeg(),
    }
  };

  const responseTime = Date.now() - startTime;
  
  return NextResponse.json({
    ...health,
    responseTime: `${responseTime}ms`
  }, {
    status: health.checks.ffmpeg ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}