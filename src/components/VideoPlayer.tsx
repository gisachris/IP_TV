'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  onStatsUpdate?: (stats: any) => void;
}

interface StreamStats {
  bitrate: number;
  currentLevel: number;
  levels: any[];
}

export default function VideoPlayer({ onStatsUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startStream = useCallback(async () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    
    try {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 10,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          startLevel: -1,
          debug: false,
          fragLoadingTimeOut: 10000,
          manifestLoadingTimeOut: 5000,
          levelLoadingTimeOut: 5000,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 5,
        });

        hlsRef.current.loadSource('/api/stream');
        hlsRef.current.attachMedia(videoRef.current);

        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          setIsPlaying(true);
          videoRef.current?.play().catch(console.error);
          
          if (hlsRef.current?.levels && onStatsUpdate) {
            onStatsUpdate({
              levels: hlsRef.current.levels,
              currentLevel: hlsRef.current.currentLevel
            });
          }
        });

        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', { type: data.type, details: data.details, fatal: data.fatal });
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, attempting recovery...');
                hlsRef.current?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, attempting recovery...');
                hlsRef.current?.recoverMediaError();
                break;
              default:
                console.log('Fatal error, destroying HLS instance');
                hlsRef.current?.destroy();
                setIsLoading(false);
                setIsPlaying(false);
                break;
            }
          } else if (data.details === 'bufferStalledError') {
            console.log('Buffer stalled, seeking forward...');
            if (videoRef.current) {
              videoRef.current.currentTime += 0.1;
            }
          }
        });

        hlsRef.current.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          if (onStatsUpdate && hlsRef.current?.levels[data.level]) {
            onStatsUpdate({
              currentLevel: data.level,
              bitrate: hlsRef.current.levels[data.level].bitrate
            });
          }
        });

      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = '/api/stream';
        await videoRef.current.play();
        setIsLoading(false);
        setIsPlaying(true);
      } else {
        throw new Error('HLS not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [onStatsUpdate]);

  const stopStream = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    setIsPlaying(false);
  };

  const changeQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const adjustVolume = (change: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, videoRef.current.volume + change / 100));
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const takeScreenshot = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      
      const link = document.createElement('a');
      link.download = `iptv-screenshot-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Auto-start on play button click
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      if (!hlsRef.current && video.src === '') {
        startStream();
      }
    };

    video.addEventListener('play', handlePlay);
    return () => video.removeEventListener('play', handlePlay);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  return {
    videoRef,
    isPlaying,
    isLoading,
    startStream,
    stopStream,
    changeQuality,
    changeSpeed,
    toggleMute,
    adjustVolume,
    toggleFullscreen,
    takeScreenshot
  };
}