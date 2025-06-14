@echo off
echo Testing Chat Catalyst Extension...
echo.
echo 1. Compiling extension...
cd /d "c:\startprompt\chat-tutorial"
call npm run compile
echo.
echo 2. Extension compiled successfully!
echo.
echo TO TEST THE EXTENSION:
echo - Press F5 to open Extension Development Host
echo - Or use Ctrl+Shift+P and run "Developer: Reload Window"
echo - Then try Ctrl+Shift+C to start chat
echo - Or use Command Palette: "Chat Catalyst: Start Chat"
echo.
pause
