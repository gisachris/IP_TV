# IPTV Player Pro

A professional IPTV streaming application built with Next.js, featuring real-time HLS streaming, adaptive bitrate, and comprehensive playback controls.

## Features

- 🎥 **Real-time HLS Streaming** - Live IPTV stream transcoding with FFmpeg
- 📊 **Adaptive Bitrate** - Automatic quality adjustment based on network conditions
- 🎛️ **Advanced Controls** - Playback speed, volume, quality selection, fullscreen
- 📸 **Screenshot Capture** - Take screenshots of live streams
- 📈 **Real-time Stats** - Bitrate, FPS, resolution, and buffer monitoring
- 🎨 **Professional UI** - Modern, responsive design with Tailwind CSS
- ⚡ **Low Latency** - Optimized for minimal streaming delay

## Tech Stack

- **Framework**: Next.js 15.1.3 with TypeScript
- **Streaming**: HLS.js for adaptive streaming
- **Video Player**: Video.js with custom controls
- **Transcoding**: FFmpeg for real-time stream processing
- **Styling**: Tailwind CSS
- **WebSocket**: Real-time communication support

## Prerequisites

- Node.js 18+ 
- FFmpeg installed and accessible in PATH
- IPTV stream source URL

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iptv-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Configure your IPTV source in `src/app/api/stream/route.ts`:
```typescript
const IPTV_SOURCE = 'your-iptv-stream-url';
```

4. Update FFmpeg path if needed in the same file:
```typescript
const FFMPEG_PATH = 'path-to-your-ffmpeg-executable';
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) to view the application.

## Production Build

```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/stream` - Returns HLS playlist (m3u8)
- `GET /api/segments/[id]` - Serves HLS video segments

## Configuration

### Environment Variables

Create a `.env.local` file:
```env
IPTV_SOURCE_URL=your-iptv-stream-url
FFMPEG_PATH=path-to-ffmpeg
PORT=3002
```

### FFmpeg Settings

The application uses optimized FFmpeg settings for low-latency streaming:
- Preset: veryfast
- Tune: zerolatency
- HLS segment time: 2 seconds
- Playlist size: 5 segments

## Browser Support

- Chrome/Edge: Full HLS.js support
- Firefox: Full HLS.js support  
- Safari: Native HLS support
- Mobile browsers: Supported via HLS.js

## Performance Optimization

- Adaptive bitrate streaming
- Efficient buffer management
- Worker-based HLS processing
- Optimized segment caching

## Troubleshooting

### Common Issues

1. **Stream not loading**: Check IPTV source URL and network connectivity
2. **FFmpeg errors**: Verify FFmpeg installation and path configuration
3. **High latency**: Adjust HLS segment time and buffer settings
4. **Quality issues**: Check source stream quality and transcoding settings

### Debug Mode

Enable detailed logging by checking browser console for HLS and FFmpeg logs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details.
