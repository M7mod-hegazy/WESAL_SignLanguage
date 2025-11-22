# GIF to WebM Conversion Guide

## Overview
This guide explains how to convert the Arabic sign language GIF files to WebM format with alpha channel transparency for use in the quiz.

## Source Files
Location: `frontend/public/videos/new/gif/`

Files to convert:
1. أريد كأساً من الماء.gif → أريد كأساً من الماء.webm
2. أعتذر لارتباطي بعمل.gif → أعتذر لارتباطي بعمل.webm
3. السلام عليكم.gif → السلام عليكم.webm
4. صباح الخير.gif → صباح الخير.webm
5. كل عام و انت بخير.gif → كل عام و انت بخير.webm
6. مبروك المولود.gif → مبروك المولود.webm
7. نجاح مبارك.gif → نجاح مبارك.webm
8. هل أنت بخير ؟.gif → هل أنت بخير ؟.webm

## Output Directory
`frontend/public/videos/new/webm/`

## Prerequisites
- FFmpeg installed on your system
- PowerShell (Windows) or Command Prompt

## Installation of FFmpeg

### Windows
1. Download from: https://ffmpeg.org/download.html
2. Or use Chocolatey: `choco install ffmpeg`
3. Or use Windows Package Manager: `winget install FFmpeg.FFmpeg`

### Verify Installation
```bash
ffmpeg -version
```

## Conversion Steps

### Option 1: Using PowerShell (Recommended)
```powershell
# Run the conversion script
.\convert_gifs_to_webm.ps1
```

### Option 2: Using Command Prompt
```cmd
# Run the batch file
convert_gifs_to_webm.bat
```

### Option 3: Manual Conversion (Single File)
```bash
ffmpeg -i "frontend/public/videos/new/gif/أريد كأساً من الماء.gif" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 "frontend/public/videos/new/webm/أريد كأساً من الماء.webm"
```

## FFmpeg Parameters Explained

- `-i` = Input file
- `-c:v libvpx-vp9` = Use VP9 video codec (best for WebM with alpha)
- `-pix_fmt yuva420p` = Pixel format with alpha channel (transparency)
- `-b:v 0` = Variable bitrate (quality-based)
- `-crf 30` = Quality level (0-63, lower = better quality, 30 is good balance)
- `-y` = Overwrite output file without asking

## Quality Settings

For different quality/size tradeoffs:
- **High Quality**: `-crf 20` (larger file, better quality)
- **Balanced**: `-crf 30` (recommended)
- **Compressed**: `-crf 40` (smaller file, lower quality)

## Verification

After conversion:
1. Check that WebM files exist in `frontend/public/videos/new/webm/`
2. Verify file sizes are reasonable (typically 500KB - 2MB each)
3. Test in browser to ensure videos play with transparency

## Integration with Quiz

The quiz data in `frontend/src/data/quizData.js` is already configured to use these WebM files:
- Video filenames are mapped to Arabic answers
- The filename (without extension) is the correct answer
- Quiz interface displays the video and expects the user to type the Arabic text

## Notes

⚠️ **Important**: The filename IS the answer, so:
- Keep Arabic filenames exactly as they are
- Don't rename files after conversion
- The quiz matches user input against the filename

## Troubleshooting

### FFmpeg not found
- Ensure FFmpeg is installed and in PATH
- Restart terminal/PowerShell after installation

### Conversion fails
- Check that source GIF files exist
- Ensure output directory is writable
- Try manual conversion command with full paths

### Videos play but no transparency
- Verify `-pix_fmt yuva420p` was used
- Check browser support (most modern browsers support VP9 with alpha)

### Large file sizes
- Increase `-crf` value (e.g., 35-40)
- Reduce resolution if needed: `-vf scale=640:-1`

## Browser Support

WebM with VP9 and alpha channel is supported in:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Edge
- ✅ Opera
- ⚠️ Safari (limited support, may need fallback)

## Next Steps

1. Run the conversion script
2. Verify WebM files are created
3. Test videos in the quiz at: https://wesal-sign-language.vercel.app/quiz
4. Commit converted files to git (or add to .gitignore if too large)
