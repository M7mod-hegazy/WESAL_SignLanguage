# PowerShell script to convert video files to WebM with alpha channel
# This script uses FFmpeg to convert videos from final2 folder to WebM format

$sourceDir = "C:\Users\M7mod Hegazy\Desktop\asd\django\SignLanguage\frontend\public\videos\final2"
$outputDir = "C:\Users\M7mod Hegazy\Desktop\asd\django\SignLanguage\frontend\public\videos\final2\webm_alpha"

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Created output directory: $outputDir" -ForegroundColor Green
}

Write-Host "Converting video files to WebM with alpha channel..." -ForegroundColor Green
Write-Host "Source: $sourceDir" -ForegroundColor Cyan
Write-Host "Output: $outputDir" -ForegroundColor Cyan
Write-Host ""

# Get all video files (mp4, avi, mov, mkv, etc.)
$videoFiles = Get-ChildItem -Path $sourceDir -Include "*.mp4", "*.avi", "*.mov", "*.mkv", "*.flv", "*.wmv" -File

if ($videoFiles.Count -eq 0) {
    Write-Host "No video files found in $sourceDir" -ForegroundColor Yellow
    exit
}

Write-Host "Found $($videoFiles.Count) video file(s) to convert" -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($file in $videoFiles) {
    $filename = $file.Name
    $name = $file.BaseName
    
    Write-Host "Converting: $filename" -ForegroundColor Yellow
    
    # Use FFmpeg to convert video to WebM with VP9 codec and alpha channel
    # yuva420p = YUV 4:2:0 with alpha channel
    # -b:v 0 -crf 30 = quality settings (lower CRF = better quality)
    $outputFile = Join-Path $outputDir "$name`_alpha.webm"
    
    & ffmpeg -i $file.FullName -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 $outputFile -y 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully converted: $name`_alpha.webm" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "✗ Failed to convert: $filename" -ForegroundColor Red
        $failCount++
    }
    Write-Host ""
}

Write-Host ""
Write-Host "Conversion complete!" -ForegroundColor Green
Write-Host "✓ Successful: $successCount" -ForegroundColor Green
Write-Host "✗ Failed: $failCount" -ForegroundColor Red
Write-Host "WebM files are in: $outputDir" -ForegroundColor Cyan
