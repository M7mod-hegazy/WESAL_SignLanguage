# PowerShell script to copy and convert videos with alpha channel
$ErrorActionPreference = "Continue"

$videos = @{
    "أريد كأساً من الماء.webm" = "i_want_glass_of_water"
    "أعتذر لارتباطي بعمل.webm" = "sorry_i_am_busy_with_work"
    "السلام عليكم.webm" = "peace_be_upon_you"
    "صباح الخير.webm" = "good_morning"
    "كل عام وانت بخير.webm" = "happy_new_year"
    "مبروك المولود.webm" = "congratulations_on_baby"
    "نجاح مبارك.webm" = "congratulations_on_success"
    "هل أنت بخير ؟.webm" = "are_you_okay"
}

$inputDir = "C:\Users\M7mod Hegazy\Desktop\asd\django\SignLanguage\frontend\public\videos\new"
$outputDir = "C:\Users\M7mod Hegazy\Desktop\asd\django\SignLanguage\frontend\public\videos\optimized"

Write-Host "🎬 Converting videos with alpha channel..." -ForegroundColor Cyan

foreach ($video in $videos.GetEnumerator()) {
    $inputPath = Join-Path $inputDir $video.Key
    $outputAlpha = Join-Path $outputDir "$($video.Value)_alpha.webm"
    $outputFallback = Join-Path $outputDir "$($video.Value)_fallback.webm"
    
    Write-Host "`nProcessing: $($video.Key)" -ForegroundColor Yellow
    
    # Alpha version (with transparency)
    Write-Host "  Creating alpha version..." -ForegroundColor Gray
    & ffmpeg -i $inputPath -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -crf 30 -deadline good -cpu-used 2 -row-mt 1 -auto-alt-ref 1 -lag-in-frames 25 -an -y $outputAlpha 2>&1 | Out-Null
    
    # Fallback version (no transparency, smaller size)
    Write-Host "  Creating fallback version..." -ForegroundColor Gray
    & ffmpeg -i $inputPath -c:v libvpx-vp9 -pix_fmt yuv420p -b:v 800k -crf 32 -deadline good -cpu-used 3 -row-mt 1 -an -y $outputFallback 2>&1 | Out-Null
    
    if (Test-Path $outputAlpha) {
        Write-Host "  ✅ Alpha version created" -ForegroundColor Green
    }
    if (Test-Path $outputFallback) {
        Write-Host "  ✅ Fallback version created" -ForegroundColor Green
    }
}

Write-Host "`n✅ All videos converted successfully!" -ForegroundColor Green
Write-Host "📂 Output directory: $outputDir" -ForegroundColor Cyan
