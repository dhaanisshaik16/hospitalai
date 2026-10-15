@echo off
title Push Hospital AI to GitHub
color 0A
cls
echo ======================================================================
echo             HOSPITAL AI - PUSH TO GITHUB (hospitalai.git)
echo ======================================================================
echo Target Repository: https://github.com/dhaanisshaik16/hospitalai.git
echo Branch:            main
echo.
echo If a GitHub sign-in window or browser prompt appears:
echo   1. Click 'Sign in with your browser'
echo   2. Click 'Authorize' in your browser
echo.
echo Pushing clean root files to main...
echo ======================================================================
echo.

call "%~dp0git.bat" push -u --force origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================================
    echo [SUCCESS] Hospital AI successfully pushed to GitHub!
    echo ======================================================================
) else (
    echo ======================================================================
    echo [FAILED] Push exited with error code %ERRORLEVEL%.
    echo ======================================================================
)
echo.
pause
