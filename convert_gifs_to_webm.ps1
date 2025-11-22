# PowerShell script to convert GIF files to WebM with alpha channel
# This script uses FFmpeg to convert the Arabic sign language GIFs

$sourceDir = "frontend\public\videos\new\gif"
$outputDir = "frontend\public\videos\new\webm"

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

Write-Host "Converting GIF files to WebM with alpha channel..." -ForegroundColor Green
Write-Host ""

# Get all GIF files
$gifFiles = Get-ChildItem -Path $sourceDir -Filter "*.gif"

foreach ($file in $gifFiles) {
    $filename = $file.Name
    $name = $file.BaseName
    
    Write-Host "Converting: $filename" -ForegroundColor Yellow
    
    # Use FFmpeg to convert GIF to WebM with VP9 codec and alpha channel
    # yuva420p = YUV 4:2:0 with alpha channel
    # -b:v 0 -crf 30 = quality settings (lower CRF = better quality)
    $outputFile = Join-Path $outputDir "$name.webm"
    
    & ffmpeg -i $file.FullName -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 $outputFile -y
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully converted: $name.webm" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to convert: $filename" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ""
Write-Host "All conversions complete!" -ForegroundColor Green
Write-Host "WebM files are in: $outputDir" -ForegroundColor Cyan
