@echo off
echo ========================================
echo    Chat Catalyst Extension Installer
echo ========================================
echo.
echo Installing Chat Catalyst Extension...
echo.

REM Check if VSIX file exists
if not exist "chat-catalyst-0.0.4.vsix" (
    echo ERROR: chat-catalyst-0.0.4.vsix not found!
    echo Please run this script from the chat-tutorial directory.
    pause
    exit /b 1
)

REM Install the extension
echo Installing extension into VS Code...
code --install-extension chat-catalyst-0.0.4.vsix

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ SUCCESS! Chat Catalyst extension installed!
    echo.
    echo Next Steps:
    echo 1. Restart VS Code completely
    echo 2. Open your project
    echo 3. Press Ctrl+Alt+C to test
    echo.
    echo For detailed testing instructions, see:
    echo PRODUCTION_TESTING.md
    echo.
) else (
    echo.
    echo ❌ FAILED! Extension installation failed.
    echo Make sure VS Code is installed and accessible via 'code' command.
    echo.
)

pause
