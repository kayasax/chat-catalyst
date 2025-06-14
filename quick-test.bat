@echo off
echo.
echo ====================================
echo    Chat Catalyst - Quick Test
echo ====================================
echo.
echo Compiling extension...
call npm run compile
if %ERRORLEVEL% neq 0 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)

echo.
echo ✅ Compilation successful!
echo.
echo Starting VS Code with extension...
echo.
echo TESTING INSTRUCTIONS:
echo 1. Wait for VS Code to fully load
echo 2. Look for the "Chat Catalyst is ready!" message
echo 3. Click "Start Chat" button OR press Ctrl+Alt+C
echo 4. Check if chat opens and prompt is injected
echo.
echo TIP: Press F12 to open Developer Console for logs
echo.

start "Chat Catalyst Test" code --extensionDevelopmentPath=.

echo.
echo Extension started in development mode!
echo Check the new VS Code window for testing.
echo.
pause
