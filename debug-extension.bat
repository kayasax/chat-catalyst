@echo off
echo ================================
echo  CHAT CATALYST DEBUGGING GUIDE
echo ================================
echo.
echo 1. Compiling extension...
cd /d "c:\startprompt\chat-tutorial"
call npm run compile
echo.
echo 2. Extension compiled! Now follow these steps:
echo.
echo ================================
echo  STEP 1: RELOAD VS CODE
echo ================================
echo - Press Ctrl+Shift+P
echo - Type "Developer: Reload Window"
echo - Press Enter
echo.
echo ================================
echo  STEP 2: CHECK CONSOLE LOGS
echo ================================
echo - Open Developer Console: Help > Toggle Developer Tools
echo - Look in Console tab for:
echo   * "Chat Catalyst extension is now active!"
echo   * "Chat Catalyst commands registered successfully!"
echo.
echo ================================
echo  STEP 3: TEST THE EXTENSION
echo ================================
echo.
echo Option A: Test Command (Verify Extension Works)
echo - Press Ctrl+Shift+P
echo - Type "Chat Catalyst: Test Extension"
echo - Should show "Chat Catalyst extension is working!"
echo.
echo Option B: Start Chat Command
echo - Press Ctrl+Shift+P
echo - Type "Chat Catalyst: Start Chat"
echo - OR press Ctrl+Alt+C
echo.
echo Option C: Use Welcome Button
echo - Click "Test Extension" button first
echo - Then click "Start Chat" button
echo.
echo ================================
echo  STEP 4: CHECK LOGS FOR ERRORS
echo ================================
echo In Developer Console, look for:
echo - "Start Chat command triggered!"
echo - "Welcome message button clicked: Start Chat"
echo - Any error messages
echo.
echo ================================
echo  TROUBLESHOOTING
echo ================================
echo If "Test Extension" works but "Start Chat" doesn't:
echo - The extension is loaded correctly
echo - There's an issue with the startChat command logic
echo.
echo If nothing works:
echo - Extension may not be loading
echo - Try pressing F5 to open Extension Development Host
echo.
pause
