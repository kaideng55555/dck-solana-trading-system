#!/bin/bash

# Generate Placeholder Sound Files
# Creates silent MP3 files for testing the SFX system
# Replace these with actual sound files later

echo "🔊 Generating placeholder sound files..."

cd "$(dirname "$0")" || exit 1

# Check if ffmpeg is installed (needed to generate MP3)
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found. Install with:"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    echo ""
    echo "⚠️  Creating empty files as placeholders instead..."
    
    # Create empty files
    touch shotgun.mp3
    touch alert.mp3
    touch rug.mp3
    touch buy.mp3
    touch sell.mp3
    touch sniper_ready.mp3
    
    echo "✅ Empty placeholder files created"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Replace these empty files with actual MP3 audio"
    echo "   2. Recommended: 0.5-2 seconds duration"
    echo "   3. Format: MP3, 44.1kHz, 128-192 kbps"
    exit 0
fi

# Generate silent MP3 files with ffmpeg
# Each file is 1 second of silence

echo "Generating shotgun.mp3 (1s silence)..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame shotgun.mp3 -y 2>/dev/null

echo "Generating alert.mp3 (0.5s silence)..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame alert.mp3 -y 2>/dev/null

echo "Generating rug.mp3 (1s silence)..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame rug.mp3 -y 2>/dev/null

echo "Generating buy.mp3 (0.8s silence)..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.8 -q:a 9 -acodec libmp3lame buy.mp3 -y 2>/dev/null

echo "Generating sell.mp3 (0.8s silence)..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.8 -q:a 9 -acodec libmp3lame sell.mp3 -y 2>/dev/null

echo "Generating sniper_ready.mp3 (1.2s silence)..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1.2 -q:a 9 -acodec libmp3lame sniper_ready.mp3 -y 2>/dev/null

echo ""
echo "✅ Placeholder sound files generated!"
echo ""
echo "📝 Files created:"
echo "   - shotgun.mp3 (1.0s)"
echo "   - alert.mp3(0.5s)"
echo "   - rug.mp3 (1.0s)"
echo "   - buy.mp3 (0.8s)"
echo "   - sell.mp3 (0.8s)"
echo "   - sniper_ready.mp3 (1.2s)"
echo ""
echo "⚠️  These are SILENT files for testing only!"
echo "   Replace with actual sound effects before production."
echo ""
echo "📚 Recommended sound sources:"
echo "   - FreeSound.org"
echo "   - Zapsplat.com"
echo "   - YouTube Audio Library"
echo "   - Custom recordings"
