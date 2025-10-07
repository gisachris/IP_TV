'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';

export default function Home() {
  const [stats, setStats] = useState({
    bitrate: 0,
    fps: 30,
    resolution: '0x0',
    buffer: 0,
    levels: [],
    currentLevel: -1
  });

  const [status, setStatus] = useState('Ready to stream. Click "Start Stream" to begin.');

  const {
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
  } = VideoPlayer({
    onStatsUpdate: (newStats) => {
      setStats(prev => ({ ...prev, ...newStats }));
    }
  });

  const updateStatus = (message: string) => {
    setStatus(`${new Date().toLocaleTimeString()}: ${message}`);
  };

  // Stats update interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        const video = videoRef.current;
        
        // Update resolution
        if (video.videoWidth && video.videoHeight) {
          setStats(prev => ({
            ...prev,
            resolution: `${video.videoWidth}x${video.videoHeight}`
          }));
        }
        
        // Update buffer
        const buffered = video.buffered;
        if (buffered.length > 0) {
          const bufferTime = Math.round(buffered.end(0) - video.currentTime);
          setStats(prev => ({ ...prev, buffer: bufferTime }));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, videoRef]);

  const primaryColor = '#f8c701';
  const primaryStyle = { backgroundColor: primaryColor };
  const textPrimaryStyle = { color: primaryColor };
  const borderPrimaryStyle = { borderColor: primaryColor };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
      {/* Header */}
      <header className="shadow-lg" style={primaryStyle}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <h1 className="text-3xl font-bold text-black">
                IPTV Player Pro
              </h1>
            </div>
            <div className="text-black font-semibold">
              🔴 LIVE
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Player Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Controls Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Playback Controls */}
            <div className="bg-gray-50 p-6 rounded-xl border-l-4" style={{ borderLeftColor: primaryColor }}>
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Playback Controls
              </h3>
              <div className="space-y-3">
                <button
                  onClick={isPlaying ? stopStream : startStream}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: isPlaying ? '#000' : primaryColor,
                    color: isPlaying ? primaryColor : '#000'
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : isPlaying ? (
                    <>⏹️ Stop Stream</>
                  ) : (
                    <>📡 Start Stream</>
                  )}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="w-full px-4 py-3 text-black rounded-lg font-semibold hover:opacity-80 transition-all"
                  style={primaryStyle}
                >
                  🔳 Fullscreen
                </button>
                <button
                  onClick={takeScreenshot}
                  className="w-full px-4 py-3 text-black rounded-lg font-semibold hover:opacity-80 transition-all"
                  style={primaryStyle}
                >
                  📸 Screenshot
                </button>
              </div>
            </div>

            {/* Quality Settings */}
            <div className="bg-gray-50 p-6 rounded-xl border-l-4" style={{ borderLeftColor: primaryColor }}>
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Quality Settings
              </h3>
              <select
                onChange={(e) => changeQuality(parseInt(e.target.value))}
                defaultValue="-1"
                className="w-full px-4 py-3 border-2 rounded-lg font-medium bg-white text-black"
                style={borderPrimaryStyle}
              >
                <option value="-1">Auto Quality</option>
                {stats.levels.map((level: any, index: number) => (
                  <option key={index} value={index}>
                    {level.height}p ({Math.round(level.bitrate/1000)} kbps)
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Controls */}
            <div className="bg-gray-50 p-6 rounded-xl border-l-4" style={{ borderLeftColor: primaryColor }}>
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793z" clipRule="evenodd" />
                  <path d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                </svg>
                Audio Controls
              </h3>
              <div className="space-y-3">
                <button
                  onClick={toggleMute}
                  className="w-full px-4 py-3 text-black rounded-lg font-semibold hover:opacity-80 transition-all"
                  style={primaryStyle}
                >
                  🔇 Mute/Unmute
                </button>
                <button
                  onClick={() => adjustVolume(-10)}
                  className="w-full px-4 py-3 text-black rounded-lg font-semibold hover:opacity-80 transition-all"
                  style={primaryStyle}
                >
                  🔉 Volume -
                </button>
                <button
                  onClick={() => adjustVolume(10)}
                  className="w-full px-4 py-3 text-black rounded-lg font-semibold hover:opacity-80 transition-all"
                  style={primaryStyle}
                >
                  🔊 Volume +
                </button>
              </div>
            </div>

            {/* Playback Speed */}
            <div className="bg-gray-50 p-6 rounded-xl border-l-4" style={{ borderLeftColor: primaryColor }}>
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Playback Speed
              </h3>
              <select
                onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                defaultValue="1"
                className="w-full px-4 py-3 border-2 rounded-lg font-medium bg-white text-black"
                style={borderPrimaryStyle}
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x Normal</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
            <video
              ref={videoRef}
              controls
              className="w-full h-[500px] bg-black"
              preload="none"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Status Bar */}
          <div className="text-black px-6 py-4 rounded-xl mt-6 font-semibold flex items-center" style={primaryStyle}>
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {status}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-6 rounded-xl text-center border-2" style={borderPrimaryStyle}>
              <div className="text-2xl font-bold" style={textPrimaryStyle}>{Math.round(stats.bitrate)} kbps</div>
              <div className="text-gray-600 font-medium mt-1">Bitrate</div>
            </div>
            <div className="bg-white p-6 rounded-xl text-center border-2" style={borderPrimaryStyle}>
              <div className="text-2xl font-bold" style={textPrimaryStyle}>{stats.fps} fps</div>
              <div className="text-gray-600 font-medium mt-1">Frame Rate</div>
            </div>
            <div className="bg-white p-6 rounded-xl text-center border-2" style={borderPrimaryStyle}>
              <div className="text-2xl font-bold" style={textPrimaryStyle}>{stats.resolution}</div>
              <div className="text-gray-600 font-medium mt-1">Resolution</div>
            </div>
            <div className="bg-white p-6 rounded-xl text-center border-2" style={borderPrimaryStyle}>
              <div className="text-2xl font-bold" style={textPrimaryStyle}>{stats.buffer}s</div>
              <div className="text-gray-600 font-medium mt-1">Buffer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}