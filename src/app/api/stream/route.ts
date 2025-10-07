import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const FFMPEG_PATH = process.env.FFMPEG_PATH || (process.platform === 'win32' ? 'C:\\Users\\Gdev\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0-full_build\\bin\\ffmpeg.exe' : 'ffmpeg');
const IPTV_SOURCE = process.env.IPTV_SOURCE_URL || 'http://41.216.123.106:5000/Iptv_1';
const MAX_RETRIES = 3;
const TIMEOUT_MS = 15000;

// Global process tracking
let activeProcess: ChildProcess | null = null;
let processStartTime: number = 0;

async function cleanupOldProcess() {
  if (activeProcess && !activeProcess.killed) {
    activeProcess.kill('SIGTERM');
    activeProcess = null;
  }
}

async function validateSource(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(IPTV_SOURCE, { 
      method: 'HEAD', 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('Source validation skipped:', error instanceof Error ? error.message : 'Unknown error');
    return true; // Skip validation if fetch fails
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  
  console.log(`[${new Date().toISOString()}] Stream request from ${clientIP}`);

  const hlsDir = path.join(process.cwd(), 'public', 'hls');
  
  try {
    await fs.mkdir(hlsDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create HLS directory:', error);
    return new NextResponse('Server configuration error', { status: 500 });
  }

  const playlistPath = path.join(hlsDir, 'playlist.m3u8');
  
  // Check if recent playlist exists
  try {
    const stats = await fs.stat(playlistPath);
    const age = Date.now() - stats.mtime.getTime();
    
    if (age < 30000) {
      const playlist = await fs.readFile(playlistPath, 'utf-8');
      console.log(`Serving cached playlist (${age}ms old)`);
      return new NextResponse(playlist, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
  } catch {
    // Playlist doesn't exist or is stale
  }

  // Validate source before starting transcoding (with fallback)
  const sourceValid = await validateSource();
  if (!sourceValid) {
    console.warn('IPTV source validation failed, proceeding anyway');
  }

  // Cleanup any existing process
  await cleanupOldProcess();

  // Start FFmpeg transcoding with live streaming settings
  activeProcess = spawn(FFMPEG_PATH, [
    '-re',
    '-i', IPTV_SOURCE,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-f', 'hls',
    '-hls_time', '4',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments+append_list+omit_endlist',
    '-hls_segment_filename', path.join(hlsDir, 'segment_%03d.ts'),
    '-hls_base_url', '/hls/',
    '-hls_allow_cache', '0',
    '-y',
    playlistPath
  ]);

  processStartTime = Date.now();

  activeProcess.stderr?.on('data', (data) => {
    const message = data.toString();
    if (message.includes('error') || message.includes('Error')) {
      console.error('FFmpeg Error:', message);
    }
  });

  activeProcess.on('error', (error) => {
    console.error('FFmpeg process error:', error);
    if (error.code === 'ENOENT') {
      console.error('FFmpeg not found. Please check FFMPEG_PATH environment variable.');
    }
    activeProcess = null;
  });

  activeProcess.on('exit', (code) => {
    console.log(`FFmpeg exited with code ${code}`);
    activeProcess = null;
  });

  // Wait for playlist with timeout
  return new Promise<NextResponse>((resolve) => {
    const checkPlaylist = setInterval(async () => {
      try {
        const playlist = await fs.readFile(playlistPath, 'utf-8');
        
        if (playlist.includes('.ts')) {
          clearInterval(checkPlaylist);
          const duration = Date.now() - startTime;
          console.log(`Playlist ready in ${duration}ms`);
          
          resolve(new NextResponse(playlist, {
            headers: {
              'Content-Type': 'application/vnd.apple.mpegurl',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }));
        }
      } catch (error) {
        // Still waiting
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkPlaylist);
      console.error(`Stream timeout after ${TIMEOUT_MS}ms`);
      resolve(new NextResponse('Stream timeout', { status: 504 }));
    }, TIMEOUT_MS);
  });
}