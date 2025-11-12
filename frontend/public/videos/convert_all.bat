@echo off
chcp 65001 >nul
echo 🎬 Converting Arabic videos to WebM format...
echo.

cd /d "%~dp0"

set INPUT_DIR=new
set OUTPUT_DIR=optimized

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo Converting: أريد كأساً من الماء.mp4
ffmpeg -i "%INPUT_DIR%\أريد كأساً من الماء.mp4" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -crf 30 -deadline good -cpu-used 2 -row-mt 1 -auto-alt-ref 1 -lag-in-frames 25 -an -y "%OUTPUT_DIR%\i_want_glass_of_water.webm"

echo Converting: أعتذر لارتباطي بعمل.mp4
ffmpeg -i "%INPUT_DIR%\أعتذر لارتباطي بعمل.mp4" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -crf 30 -deadline good -cpu-used 2 -row-mt 1 -auto-alt-ref 1 -lag-in-frames 25 -an -y "%OUTPUT_DIR%\sorry_i_am_busy_with_work.webm"

echo Converting: السلام عليكم.mp4
ffmpeg -i "%INPUT_DIR%\السلام عليكم.mp4" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -crf 30 -deadline good -cpu-used 2 -row-mt 1 -auto-alt-ref 1 -lag-in-frames 25 -an -y "%OUTPUT_DIR%\peace_be_upon_you.webm"

echo Converting: صباح الخير.mp4
ffmpeg -i "%INPUT_DIR%\صباح الخير.mp4" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -crf 30 -deadline good -cpu-used 2 -row-mt 1 -auto-alt-ref 1 -lag-in-frames 25 -an -y "%OUTPUT_DIR%\good_morning.webm"

echo Converting: كل عام وانت بخير.mp4
ffmpeg -i "%INPUT_DIR%\كل عام وانت بخير.mp4" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -crf 30 -deadline good -cpu-used 2 -row-mt 1 -auto-alt-ref 1 -lag-in-frames 25 -an -y "%OUTPUT_DIR%\happy_new_year.webm"

echo Converting: مبروك المولود.mp4
ffmpeg -i "%INPUT_DIR%\مبروك المولود.mp4" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -crf 30 -deadline good -cpu-used 2 -row-mt 1 -auto-alt-ref 1 -lag-in-frames 25 -an -y "%OUTPUT_DIR%\congratulations_on_baby.webm"

echo Converting: نجاح مبارك.mp4
ffmpeg -i "%INPUT_DIR%\نجاح مبارك.mp4" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -crf 30 -deadline good -cpu-used 2 -row-mt 1 -auto-alt-ref 1 -lag-in-frames 25 -an -y "%OUTPUT_DIR%\congratulations_on_success.webm"

echo Converting: هل أنت بخير ؟.mp4
ffmpeg -i "%INPUT_DIR%\هل أنت بخير ؟.mp4" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M -crf 30 -deadline good -cpu-used 2 -row-mt 1 -auto-alt-ref 1 -lag-in-frames 25 -an -y "%OUTPUT_DIR%\are_you_okay.webm"

echo.
echo ✅ Conversion complete!
echo 📂 Videos saved to: %OUTPUT_DIR%
echo.
pause
