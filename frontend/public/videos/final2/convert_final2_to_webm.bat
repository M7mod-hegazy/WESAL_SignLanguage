@echo off
REM Batch script to convert video files to WebM with alpha channel
REM This script uses FFmpeg to convert videos from final2 folder to WebM format

setlocal enabledelayedexpansion

set "sourceDir=C:\Users\M7mod Hegazy\Desktop\asd\django\SignLanguage\frontend\public\videos\final2"
set "outputDir=C:\Users\M7mod Hegazy\Desktop\asd\django\SignLanguage\frontend\public\videos\final2\webm_alpha"

REM Create output directory if it doesn't exist
if not exist "%outputDir%" (
    mkdir "%outputDir%"
    echo Created output directory: %outputDir%
)

echo.
echo Converting video files to WebM with alpha channel...
echo Source: %sourceDir%
echo Output: %outputDir%
echo.

set "successCount=0"
set "failCount=0"

REM Convert all video files
for %%F in ("%sourceDir%\*.mp4" "%sourceDir%\*.avi" "%sourceDir%\*.mov" "%sourceDir%\*.mkv" "%sourceDir%\*.flv" "%sourceDir%\*.wmv") do (
    if exist "%%F" (
        set "filename=%%~nxF"
        set "name=%%~nF"
        
        echo Converting: !filename!
        
        set "outputFile=%outputDir%\!name!_alpha.webm"
        
        ffmpeg -i "%%F" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 "!outputFile!" -y
        
        if !errorlevel! equ 0 (
            echo [OK] Successfully converted: !name!_alpha.webm
            set /a successCount+=1
        ) else (
            echo [FAILED] Failed to convert: !filename!
            set /a failCount+=1
        )
        echo.
    )
)

echo.
echo Conversion complete!
echo Successful: %successCount%
echo Failed: %failCount%
echo WebM files are in: %outputDir%
echo.
pause
