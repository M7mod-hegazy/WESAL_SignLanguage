@echo off
REM Convert GIF files to WebM with alpha channel
REM This script uses FFmpeg to convert the Arabic sign language GIFs

setlocal enabledelayedexpansion

set "SOURCE_DIR=frontend\public\videos\new\gif"
set "OUTPUT_DIR=frontend\public\videos\new\webm"

REM Create output directory if it doesn't exist
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo Converting GIF files to WebM with alpha channel...
echo.

REM Convert each GIF file
for %%F in ("%SOURCE_DIR%\*.gif") do (
    set "filename=%%~nF"
    set "name=!filename:~0,-4!"
    echo Converting: !filename!
    
    REM Use FFmpeg to convert GIF to WebM with VP9 codec and alpha channel
    ffmpeg -i "%%F" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 "%OUTPUT_DIR%\!name!.webm" -y
    
    if !errorlevel! equ 0 (
        echo ✓ Successfully converted: !name!.webm
    ) else (
        echo ✗ Failed to convert: !filename!
    )
    echo.
)

echo.
echo All conversions complete!
echo WebM files are in: %OUTPUT_DIR%
pause
